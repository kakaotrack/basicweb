# ** Gallague (Beta Version)**

**기초웹개발론 프로젝트**

- [Gallague](https://gallague-6e78212e76a0.herokuapp.com/) <- Link
- [GitHub](https://github.com/kangdaelyeol/gallague) <- Link

## Table of Contents

1. **Start Game**
   - 게임 시작
   - 작동 방법
1. **Description**
   - Hero
   - enemy

> ## `1. Start Game`
>
> ### 게임 시작
>
> - **`"R"` 버튼으로 게임을 시작 할 수 있습니다**
> - **`"Q"` 버튼으로 게임을 종료 할 수 있습니다**
>
> ### 작동 방법
>
> - **방향키로 Hero를 조작할 수 있습니다.**
> - **`"Shift"` 키를 사용 하여 빠르게 달릴 수 있습니다**
> - **`"z"` 키를 사용하여 순간적으로 폭발적인 움직임을 사용할 수 있습니다.**
> - **`"Space"` 키를 사용하여 Bullet을 발사합니다.**
>   > ### Bullet (Charging)
>   >
>   > - **Space 키를 누른 상태로 에너지를 충전 할 수 있습니다.**
>   > - **충전 된 에너지에 따라 에너지파를 수행 합니다.**
>   >
>   > ### Energy Par
>   >
>   > - **동작 1(special shot): 일직선 방향으로 총알을 난무합니다**
>   > - **동작 2(Energy Par): 초기에 일직선 방향으로 에너지 파를 발사 한 후 강도가 증가 하며 측면으로 점차 범위를 넓히며 에너지파를 발사 합니다.**

> ## `2. Description`
>
> ### Hero
>
> > - **`Hero`는 3개의 목숨을 가지고 있습니다**
> > - **`Enemy`와 충돌 시 목숨을 잃습니다**
> > - **목숨을 다 잃게 되면 게임이 종료됩니다**
>
> ### Enemy
>
> > - **`Enemy` 는 일정 간격(30 frames) 마다 생성 되며 항상 최상단 위치에서 생성 됩니다**
> > - **크기와 이동 속도는 Random값으로 결정 되며 x, y축으로 동일한 속도로 이동합니다**
