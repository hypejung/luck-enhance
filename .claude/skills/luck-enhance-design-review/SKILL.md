---
name: luck-enhance-design-review
description: Use this skill whenever the user asks for a new balance change, item/effect design, or content addition in the "운빨강화하기" (luck-enhance) game (hypejung/luck-enhance) that isn't already a small, explicit, unambiguous numeric tweak. Trigger on requests like "~를 설계해줘", "~효과를 넣어줘", "테이블로 보여줘", or any new system/content idea for game-source.html. Also trigger when the user asks to change how design work for this project should be handled.
---

# 운빨강화하기 설계 우선 워크플로우

이 프로젝트(`game-source.html`)에서 **새로운 시스템, 아이템, 효과, 콘텐츠**를 추가하거나 바꾸는 작업은
**바로 코드에 반영하지 않는다.** 반드시 아래 순서를 따른다.

## 워크플로우

1. **설계안을 표(테이블)로 정리해서 먼저 보여준다.**
   - 무엇을 바꾸는지, 수치가 얼마인지, 왜 그렇게 잡았는지 표/짧은 설명으로 제시.
   - 이 단계에서는 `Edit`/`Write`로 `game-source.html`을 건드리지 않는다.
   - 애매한 부분(예: 특정 등급이 어느 그룹에 속하는지)이 있으면 가정을 명시하고 확인을 요청한다.
2. **사용자의 컨펌을 기다린다.** "이대로 구현해줘" / "좋아" / 구체적인 수정 지시 등 명확한 승인이
   오기 전까지는 구현하지 않는다. 사용자가 일부만 수정 요청하면, 수정한 표를 다시 보여주고
   또 컨펌을 받는다(전체를 다시 구현 전까지 반복).
3. **컨펌 후에만 코드에 반영한다.** 이 시점부터는 평소처럼 직접 구현 + 브라우저에서 검증 + 커밋/배포
   (`luck-enhance-deploy` 스킬 워크플로우 사용)까지 진행한다.

## 이 스킬이 적용되는 경우

- 새 아이템/무기/장신구/룬 등급, 새 특수효과, 새 시스템(예: 도감, 대장장이, 컬렉션 보너스) 설계
- 기존 시스템의 구조를 바꾸는 큰 변경(단순 수치 조정이 아니라 매커니즘 자체가 달라지는 경우)
- "테이블로 보여줘", "초안 만들어줘", "어떻게 할지 정리해줘" 같은 요청

## 이 스킬이 적용되지 않는 경우 (바로 구현해도 됨)

- 이미 합의된 설계를 실제로 구현해달라는 요청 ("이대로 구현해줘")
- 명확하고 국소적인 수치 조정 ("이 확률 좀 낮춰줘", "이 비용 20% 올려줘" 등 — 새 시스템이 아님)
- 버그 수정
- 이미 여러 번 논의된 내용의 사소한 후속 조정

## 참고

- 배포(빌드+커밋+푸시)는 이 스킬의 범위가 아니다. 컨펌 후 구현이 끝나면 `luck-enhance-deploy` 스킬을
  참고해서 진행한다.
- 표는 한국어로, 이 프로젝트의 기존 설계 문서 스타일(등급별 구분, 수치 근거 설명)을 따른다.
