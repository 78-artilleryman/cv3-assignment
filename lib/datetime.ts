const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 원본 방송시간 문자열을 "26.07.20 (월) 14:58" 형태로 변환한다.
 *
 * lb: "2607201458"   (10자리, YYMMDDHHMM)
 * hs: "202607201440" (12자리, YYYYMMDDHHMM)
 * 두 포맷을 모두 처리한다.
 */
export function formatBroadcastTime(raw: string): string {
  let year: string; // 4자리 연도
  let yy: string; // 2자리 연도
  let mm: string;
  let dd: string;
  let hh: string;
  let mi: string;

  if (raw.length === 12) {
    year = raw.slice(0, 4);
    yy = raw.slice(2, 4);
    mm = raw.slice(4, 6);
    dd = raw.slice(6, 8);
    hh = raw.slice(8, 10);
    mi = raw.slice(10, 12);
  } else if (raw.length === 10) {
    yy = raw.slice(0, 2);
    year = `20${yy}`;
    mm = raw.slice(2, 4);
    dd = raw.slice(4, 6);
    hh = raw.slice(6, 8);
    mi = raw.slice(8, 10);
  } else {
    // 예상치 못한 포맷은 원본 그대로 반환 (방어적 처리)
    return raw;
  }

  // 요일 계산은 타임존 영향을 받지 않도록 UTC 기준으로 계산한다.
  const day = new Date(Date.UTC(Number(year), Number(mm) - 1, Number(dd)));
  const dow = WEEKDAYS[day.getUTCDay()];

  return `${yy}.${mm}.${dd} (${dow}) ${hh}:${mi}`;
}
