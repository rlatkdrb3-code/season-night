# 시즌의 밤 (D-3조)

정적 파일 하나(index.html)로 동작하는 웹게임입니다. 빌드 과정 없음.

## Vercel 배포 (터미널)

    cd season-night
    npx vercel --prod

- 처음이면 브라우저에서 Vercel 로그인 창이 뜹니다.
- "Link to existing project?" 에서 새 프로젝트로 만들려면 N, 기존 night-of-closing을 덮어쓰려면 Y.
- 끝나면 https://<프로젝트명>.vercel.app 주소가 출력됩니다.

## 문항 수정

index.html 안의 `const QUESTIONS = [` 목록을 고치고 다시 `npx vercel --prod`.
