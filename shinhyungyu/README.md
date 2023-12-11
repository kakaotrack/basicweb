# 간단한 우주 게임

Microsoft의 Web Dev for Beginners 리포지토리를 기반으로 작성한 간단한 우주 게임입니다. 해당 프로젝트에서 몇 가지 보완하여 실제로 플레이 가능한 게임으로 만들었습니다. 다음은 변경한 내용입니다.

- `setInterval` 대신 재귀적인 `window.requestAnimationFrame()` 호출을 사용하여 애니메이션을 부드럽게 만들었습니다.

```javascript
window.requestAnimationFrame(gameLoop);

function gameLoop(timeStamp) {
  // 그림 그리기 및 업데이트 로직
  window.requestAnimationFrame(gameLoop);
}
```

- 원래는 `keyup` 이벤트를 사용하여 입력을 받았는데, 이는 키를 누를 때가 아니라 키를 놓을 때 작동하며 키를 계속 누르고 있어도 반복해서 이동할 수 없었습니다. 이를 해결하기 위해 `keydown` 이벤트와 `keyup` 이벤트를 같이 사용하여 키를 놓을 때 이동을 멈추도록 했습니다.

- 원래 게임에는 적 우주선이 화면을 벗어날 때 실패 조건이 없었지만, 이것을 추가했습니다.

- 텍스트를 한글로 변경하였습니다.

게임을 실행하려면 이 리포지토리를 클론하고 `npm start`를 실행한 다음 웹 브라우저 주소에 `localhost:5000`를 입력하여 이동하면 됩니다.(터미널 에뮬레이터가 지원하는 경우 클릭/ctrl+클릭).
