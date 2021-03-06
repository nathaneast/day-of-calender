# day-off-calender

![11](https://user-images.githubusercontent.com/47707076/89734588-ff845180-da97-11ea-8601-fd663ae274c6.gif)

## 프로젝트를 하게된 계기
    여자친구의 샵에서 휴무일을 정할때 달력에 수기로 모두 적고 사진을 찍어 카톡방에 공유하는
    시스템을 보고 클릭 한번에 쉽게 할 수 있는 방법이 없을까 고민을 하다가 만들게 되었다.
    다음달부터 사용해본다고 하는데 기대가 된다. 유용한 어플리케이션이 되었으면 좋겠다.


## 기능
* **유저 추가** (5명까지 가능)
* **유저 삭제** (캘린더에 있는 모든 유저 데이터가 사라짐)
* 유저가 해당 날짜를 휴무일로 체크했는데 한번 더 클릭시 **해당 날짜에서 유저를 제거**
* 유저 생성시 이름 5자 제한, 유저 5명 제한,  유저 더블클릭시 유저 삭제 유무 등등 **모달창**


## 기술 스택
    바닐라 자바스크립트 
    파이어베이스


## 힘들었던점
### 1. 비동기 제어

    유저 삭제시 해당 유저의 모든 휴무일 데이터를 삭제하는 과정에서 비동기 제어가 내뜻대로 
    되지않고 코드도 깔끔하지 않아서 이 부분은 꼭 다시 공부하고 연구하면서 리팩토링 
    해야겠다고 느꼇다. 

### 2. 파이어베이스 연결, 배포
    파이어 베이스 연결과 배포를 하면서 많은 삽질을 하였는데, 배포시에 아무리 올바른 방법으로
    배포를 하여도 되지가 않아서 반 포기상태였다. 그런데 다음날 보니 떡하니 배포가 되어 있어
    서 매우 당황스럽고 허무했다. 배포가 바로 되는게 아니고 어느정도 시간이 지난 후에 되는것
    같다. 그리고 파이어베이스로 데이터를 추가,삭제하는 과정에서 테스트 할때 빠르게 막 사용하
    면 잘 되던것도 데이터 추가,삭제시 다른곳에 저장되거나, 누락되거나 하는 오류가 있었다.
    이 부분은 파이어베이스의 기술적인 문제인지 나의 로직 문제인지 다시한번 봐야겠다.


## 아쉬운점
### 모바일 최적화
    모바일 최적화가 되어있지 않아서 현재 사용하려면 데스크탑에서 어플리케이션을 이용하고 
    캡처한 후에 카톡방에 보내는게 최선이다. 이런 번거로움 없이 모바일로 사용 가능하도록 
    꼭 모바일 최적화를 해야겠다. 


## 느낀점
### 1.  리액트 라이브러리의 필요성을 느꼈다.
    이번 프로젝트는 유저의 조작에 따라서 특정 돔을 바꾸는게 핵심 로직이었다. 그래서 일련의 
    돔을 다시 그리는 로직을 만들면서 만약 리액트를 사용하였다면 상태가 바뀌면 저절로 돔을 
    다시 그리니 정말 편리하고 기능별로 작게 컴포넌트로 쪼개놓으면 어플리케이션이 어떻게 
    구성되어 있는지 한눈에 알아볼 수 있고 코드의 중복도 많이 줄일 수 있겠다 라는 생각을 
    정말 많이 했다.

### 2. 자바스크립트 기본기의 중요성
     몇달만에 다시 코딩 공부를 하는거라서 서서히 감을 잡을 수 있는 좋은 경험이었고 재미있게
     작업했다. 앞으로도 자바스크립트만 이용해서 만드는 프로젝트를 자주 하면서 기본기를 더욱
     탄탄히 하고싶다. 개인적으로 여자친구가 사용하면서 불편한점, 더 필요한 기능과 아이디어를
     착안해서 확장, 고도화 하고싶다



