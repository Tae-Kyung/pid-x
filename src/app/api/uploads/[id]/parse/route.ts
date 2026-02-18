/**
 * T-021: 통합 파싱 파이프라인
 * POST /api/uploads/:id/parse — Vercel Serverless Function (maxDuration: 300)
 *
 * 실행 순서:
 * 1. 텍스트 추출 (0~30%)
 * 2. 메타데이터 파싱 (30~40%)
 * 3. 라인 파싱 (40~60%)
 * 4. 장비 파싱 (60~70%)
 * 5. 패키지 파싱 (70~85%)
 * 6. 계장 파싱 (85~90%)
 * 7. Golden Joint 파싱 (90~95%)
 * 8. 최종 확인 (95~100%)
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  extractTextFromPdf,
  savePageTexts,
  updateParseProgress,
} from '@/lib/parser/pdf-extractor';
import { parseMetadata, saveMetadata } from '@/lib/parser/metadata-parser';
import { parseLines, saveLines } from '@/lib/parser/line-parser';
import { parseEquipment, saveEquipment } from '@/lib/parser/equipment-parser';
import { parsePackages, savePackages } from '@/lib/parser/package-parser';
import { parseInstruments, saveInstruments } from '@/lib/parser/instrument-parser';
import { parseGoldenJoints, saveGoldenJoints } from '@/lib/parser/golden-joint-parser';

// Vercel Pro: maxDuration 300초, memory 3008MB (vercel.json에서 설정)
export const maxDuration = 300;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: uploadId } = await params;

  // 인증 확인
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // service role 클라이언트 (RLS 우회)
  const serviceClient = createServiceClient();

  // 업로드 레코드 조회
  const { data: uploadRaw, error: uploadError } = await serviceClient
    .from('pdf_uploads')
    .select('*')
    .eq('id', uploadId)
    .single();

  if (uploadError || !uploadRaw) {
    return NextResponse.json({ error: '업로드를 찾을 수 없습니다.' }, { status: 404 });
  }

  const upload = uploadRaw as {
    id: string;
    project_id: string;
    storage_path: string;
    parse_status: string;
    filename: string;
  };

  if (upload.parse_status === 'processing') {
    return NextResponse.json({ error: '이미 파싱이 진행 중입니다.' }, { status: 409 });
  }

  const projectId = upload.project_id;

  // 파싱 시작
  await updateParseProgress(uploadId, 0, 'processing');

  try {
    // ================================================================
    // Step 1: 텍스트 추출 (0~30%)
    // ================================================================
    const pages = await extractTextFromPdf(
      upload.storage_path,
      async (current, total) => {
        const progress = Math.round((current / total) * 30);
        await updateParseProgress(uploadId, progress);
      }
    );

    // total_pages 업데이트
    await serviceClient
      .from('pdf_uploads')
      .update({ total_pages: pages.length })
      .eq('id', uploadId);

    // 텍스트 DB 저장
    await savePageTexts(uploadId, pages);
    await updateParseProgress(uploadId, 30);

    // pageTexts를 파서에 전달할 형식으로 변환
    const pageTexts = pages.map((p, i) => ({
      id: `temp-${i}`,
      page_number: p.pageNumber,
      raw_text: p.rawText,
    }));

    // ================================================================
    // Step 2: 메타데이터 파싱 (30~40%)
    // ================================================================
    let unitIdMap = new Map<string, string>();
    try {
      const metadataResult = parseMetadata(pageTexts);
      unitIdMap = await saveMetadata(projectId, metadataResult);
      await updateParseProgress(uploadId, 40);
    } catch (err) {
      console.error('메타데이터 파싱 실패 (skip):', err);
      await updateParseProgress(uploadId, 40);
    }

    // ================================================================
    // Step 3: 라인 파싱 (40~60%)
    // ================================================================
    let lineCount = 0;
    try {
      const lines = parseLines(pageTexts);
      lineCount = await saveLines(projectId, lines, unitIdMap);
      await updateParseProgress(uploadId, 60);
    } catch (err) {
      console.error('라인 파싱 실패 (skip):', err);
      await updateParseProgress(uploadId, 60);
    }

    // ================================================================
    // Step 4: 장비 파싱 (60~70%)
    // ================================================================
    let equipCount = 0;
    try {
      const equipment = parseEquipment(pageTexts);
      equipCount = await saveEquipment(projectId, equipment);
      await updateParseProgress(uploadId, 70);
    } catch (err) {
      console.error('장비 파싱 실패 (skip):', err);
      await updateParseProgress(uploadId, 70);
    }

    // ================================================================
    // Step 5: 패키지 파싱 (70~85%)
    // ================================================================
    let packageCount = 0;
    try {
      const packages = parsePackages(pageTexts);
      packageCount = await savePackages(projectId, packages);
      await updateParseProgress(uploadId, 85);
    } catch (err) {
      console.error('패키지 파싱 실패 (skip):', err);
      await updateParseProgress(uploadId, 85);
    }

    // ================================================================
    // Step 6: 계장 파싱 (85~90%)
    // ================================================================
    let instrumentCount = 0;
    try {
      const instruments = parseInstruments(pageTexts);
      instrumentCount = await saveInstruments(projectId, instruments);
      await updateParseProgress(uploadId, 90);
    } catch (err) {
      console.error('계장 파싱 실패 (skip):', err);
      await updateParseProgress(uploadId, 90);
    }

    // ================================================================
    // Step 7: Golden Joint 파싱 (90~95%)
    // ================================================================
    let gjCount = 0;
    try {
      const goldenJoints = parseGoldenJoints(pageTexts);
      gjCount = await saveGoldenJoints(projectId, goldenJoints);
      await updateParseProgress(uploadId, 95);
    } catch (err) {
      console.error('Golden Joint 파싱 실패 (skip):', err);
      await updateParseProgress(uploadId, 95);
    }

    // ================================================================
    // Step 8: 완료 (95~100%)
    // ================================================================
    await updateParseProgress(uploadId, 100, 'completed');

    return NextResponse.json({
      status: 'completed',
      stats: {
        pages: pages.length,
        lines: lineCount,
        equipment: equipCount,
        packages: packageCount,
        instruments: instrumentCount,
        goldenJoints: gjCount,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '파싱 중 알 수 없는 오류';
    console.error('파싱 파이프라인 실패:', message);
    await updateParseProgress(uploadId, 0, 'failed', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
