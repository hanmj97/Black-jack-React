# 업로드 파일 확인
main branch 에서 확인가능

# 상세
개발기간 : 3주

개발환경 : React + Node.js + Mysql + VsCode

개발목적 : React와 Node.js의 학습 및 이해
 



# 블랙잭게임 설명 및 규칙

블랙잭 게임이란?
먼저 베팅 금액을 정한다. 배당율은 건 금액만큼을 받는 게 기본. 100원을 걸어 이기면 200원을 받고 지면 건 금액인 100원을 잃는다.

카드의 숫자 계산은 카드에 써 있는 숫자 그대로. 이 숫자를 더해서 21을 만들면 되는 간단한 게임이다. 
(K, Q, J는 10에 해당하며, A는 1 혹은 11 어느 쪽으로도 계산할 수 있다.)

카드 두 장을 기본적으로 지급받게 되며, 카드 숫자를 합쳐 가능한 21에 가깝게 만들면 이기는 게임. 
처음 받은 2장 합쳐 21이 나오는 경우 블랙잭이 되며 21이 되지 않았을 경우 원한다면 얼마든지 카드를 계속 뽑을 수 있다.
* 블랙잭? : 처음 2장의 카드가 에이스와 10(J·Q·K를 포함)으로 21점이 된 것을 '블랙잭'이라고 하며, 베팅액의 1.5배를 얻는다.

하지만 카드 숫자의 합이 21을 초과하게 되는 순간 '버스트'라고 하며 딜러의 결과에 관계없이 플레이어가 패배한다.
(21을 넘지않는다면 딜러의 카드 숫자의 합과 자신이 가진 카드 숫자의 합중 21에 근접한 사람이 승리한다.)



# 게임 규칙
* 시작시 지급금액은 300$
* 카드는 보통 조커를 제외한 52장을 사용하는데 총 6팩(52*6 = 312)의 카드를 사용한다.
  (312장 -> 30장이하가 될때까지 사용한 카드는 버리면서 게임을 진행 / 플레이어가 파산하면 리셋해서 312장 시작)
* 원래는 2~8명씩 진행을 하지만 내가 만드는 블랙잭 게임에서는 1:1로 딜러와 승부를 겨룬다.
* 숫자 카드 : 숫자 그대로 적용 / K/Q/J : 10으로 계산 / A : 1 혹은 11 (11으로 계산했을때 21이 초과되면 자동 1로 계산 아니라면 11)
* 딜러가 블랙잭이면 블랙잭카드를 가지지않았을경우 무조건 패배한다.
* 플레이어는 2장의 카드를 받으며 딜러도 2장의카드를 받아 1번째카드를 비공개하는것 이외에는 플레이어의 카드는 공개된다.
* 딜러와 참가자가 동시에 블랙잭인 경우에는 푸시(Push)라 하여 무승부가 된다. 이 경우엔 플레이어는 얻는 건 없고 자신이 베팅한 금액만 돌려받는다.
* 참가자들은 블랙잭이 아닌 경우, 합계가 21점에 가까워지도록 하기 위해 딜러로부터 카드를 추가로 받을 수 있다. 
  (추가 카드는 합계가 21이 되거나, 초과하지 않는 한 제한없이 몇 장이라도 요구할 수 있다.)
* 한편 카드를 더 받지 않는 것이 유리하다고 판단되면 카드를 더 받지 않아도 된다.
* 딜러는 참가자들의 추가카드 받기가 모두 끝난 뒤에 정해진 규칙에 따라 카드를 더 받을 것인지를 결정한다. 
  (딜러는 가진 카드의 합계가 16점 이하이면 반드시 1장을 더 받아야 하고, 17점 이상이면 카드를 더 받지 않고 멈춘다.)
* 자신의 숫자가 낮더라도 딜러가 17이 되기 전까지는 무조건 카드를 더 받아야 하기 때문에(일명 Dealer's hit rule) 21을 넘겨 버스트가 되어버릴 경우엔 딜러를 제외한 버스트 되지 않은 모든 플레이어의 승리가 된다. 
  (딜러가 16이하에서 힛을 했는데 21이 넘어 버스트가 되면 버스트되지않은경우 무조건 승리한다)
  -> 내가 이기지 않아도 딜러가 지면 이기는 게임
* 베팅금액 최소값 존재(10$)


# 게임 세부 규칙
* Hit(힛) : 처음 2장의 상태에서 카드를 더 뽑는 것 

* Stay(스테이) : 카드를 더 뽑지 않고 차례를 마치는 것

* Split(스플릿) : 처음받은 2장의 카드가 같은 숫자일 경우에 패를 두 개로 나누어 게임을 동시에 두 번 할 수 있다. 
                  이후 또 똑같은 숫자가 나오면 계속해서 스플릿해서 진행 할 수 있다.
                  (참고로 A,A를 스플릿해서 A,10이 나왔어도 블랙잭처럼 1.5배를 주는 것은 아니고 일반 21로 간주해서 1배만 준다. -> 스플릿에서 블랙잭인경우는 인정 x
                  이때 딜러가 블랙잭이면 패배)

* Doubledown(더블다운) : 돈을 두 배로 거는 것. 본래 합이 21이 넘지 않는 한 무제한으로 뽑을 수 있는 카드를 이후 단 하나만 더 받는 조건으로 돈을 두 배로 걸 수 있다.

* Bust(버스트) : 카드 총합이 21을 넘는 경우. 플레이어가 버스트 당하면 이후 경기 진행에 상관없이 바로 패배가 확정되어 배팅액을 잃는다.
                 딜러가 버스트 당하면 그 시점까지 살아있던 다른 플레이어들은 갖고 있는 패에 상관없이 승리한다.

* Blackjack(블랙잭) : 블랙잭에서 가장 좋은 패. A 한장과 10에 해당하는 패(10,J,Q,K)로 21을 이루는 경우 베팅 금액의 1.4배를 돌려준다.
                      (딜러도 블랙잭이 아닌 이상 무조건적인 승리)

* Insurance(인슈어런스) : 딜러의 오픈된 카드가 스페이드 A일 경우, 딜러가 블랙잭이 나올 가능성에 대비해 보험을 들어두는 것을 말한다.
                          (이때 보험금은 이번게임에 배팅한 금액의 절반이고, 만약 딜러가 블랙잭이면 보험금의 2배를 돌려받을 수 있다.
                          만약 딜러가 블랙잭이아니면 배팅금액 + 보험금을 모두 잃게된다.)

* Push(푸시) : 플레이어와 딜러가 무승부인 경우로 배팅한 금액을 그대로 돌려받을 수 있다.

* Perfect Pair(퍼펙트 페어) : 플레이어가 처음 지급받는 두 카드의 모양, 숫자, 색깔이 모두 같은 경우 퍼펙트페어 베팅금액의 30배를 돌려받는다.



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
