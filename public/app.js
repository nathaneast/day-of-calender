import firebase from './firebase.js';

const database = firebase.database();

const dates = document.querySelector('.calender-dates');
const currMonth = document.querySelector('.currMonth');
const backMonthBtn = document.querySelector('.backMonthBtn');
const nextMonthBtn = document.querySelector('.nextMonthBtn');
const addUserBtn = document.querySelector('.userBtn');

const modal = document.querySelector('.modal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalMessage = document.querySelector('.message');
const modalUserInput = document.querySelector('.userInput');
const modalBtns = document.querySelector('.btns');

const userList = document.querySelector('.userList');

const utils = {
  colors: ['pink','purple','yellow','green','blue'],
  selectColor: async () => {
    let currUserColor = null;

    await database.ref('/selectedColor').once('value', snapshot => {
      const selectedColor = snapshot.val();
      if (selectedColor) {
        for (let i = 0; i < utils.colors.length; i++) {
          if (!selectedColor[utils.colors[i]]) {
            currUserColor = utils.colors[i];
            break;
          }
        }
      } else {
        currUserColor = utils.colors[0];
      }
    });

    return currUserColor;
  }
}

const databaseProcess = {
  deleteUserColor: () => {
    database.ref(`users/${userProcess.selectedUser.userKey}/userColor`).once('value', snapshot => {
      const userColor = snapshot.val();

      database.ref('selectedColor').once('value', snapshot => {
        const colors = snapshot.val();
        delete colors[userColor];
        database.ref('selectedColor').set(colors);
      });
    });
  },
  deleteUser: () => {
    database.ref(`/users/${userProcess.selectedUser.userKey}`).remove();
  },
  deleteUserDayOff: () => {
    database.ref(`users/${userProcess.selectedUser.userKey}/dayOffDates`).once('value', snapshot => {
      const userDayOffDates = snapshot.val();

      // 리팩토링 필요 
      if (userDayOffDates) {
        Object.keys(userDayOffDates).forEach((yearMonth, ymIndex) => {
          Object.keys(userDayOffDates[yearMonth]).forEach((date, dateIndex) => {

            database.ref(`dates/${yearMonth}/${date}`).once('value', snapshot => {
              const dayOffUsers = snapshot.val();

              if (dayOffUsers) {
                delete dayOffUsers[userProcess.selectedUser.userKey];
                database.ref(`dates/${yearMonth}/${date}`).set(dayOffUsers);
              } else {
                database.ref(`dates/${yearMonth}/${date}`).remove();
              }

              if (ymIndex + 1 === Object.keys(userDayOffDates).length && dateIndex + 1 === Object.keys(userDayOffDates[yearMonth]).length) {
                databaseProcess.deleteUser();
                userProcess.selectedUser.userKey = null;
                userProcess.selectedUser.userName = null;
              }
            });
          });
        });
      } else {
        databaseProcess.deleteUser();
        userProcess.selectedUser.userKey = null;
        userProcess.selectedUser.userName = null;
      }
    });
  },
  getCurrMonthCalender: () => {
    const currYear = calenderProcess.currDate.getFullYear();
    const currMonth = calenderProcess.currDate.getMonth() + 1;
    const currKey = `${currYear}-${currMonth}`;

    database.ref(`dates/${currKey}`).once('value', snapshot => {
      const currMonthDates = snapshot.val();

      if (currMonthDates) {
        Object.keys(currMonthDates).forEach(date => {
          Object.keys(currMonthDates[date]).forEach(userKey => {
            const targetDate = dates.querySelector(`.date-${date}`);
            const targetDateUserList = targetDate.querySelector('.date-userList');
            const user = document.createElement('div');
            const userName = document.createElement('span');
            const name = currMonthDates[date][userKey].split('-')[0];
            const color = currMonthDates[date][userKey].split('-')[1];
            
            user.classList.add(`userKey-${userKey}`);
            userName.classList.add('user-name');
            userName.classList.add(`userColor-${color}`);
            userName.innerText = name;

            targetDateUserList.appendChild(user);
            user.appendChild(userName);
          });
        });
      }
    });
  },
  getUserData: () => {
    database.ref(`users`).once('value', snapshot => {
      const users = snapshot.val();

      if (users) {
        const usersKey = Object.keys(users);

        usersKey.forEach(key => {
          const user = document.createElement('div');
          const userName = document.createElement('span');
          const userColor = users[key]['userColor'];

          user.classList.add(`userKey-${key}`);
          user.classList.add(`userColor-${userColor}`);
          user.classList.add('user');

          userName.innerText = users[key].userName;

          userList.appendChild(user);
          user.appendChild(userName);

          user.addEventListener('click', e => {
            userProcess.selectUserHandler(e);
          });
          user.addEventListener('dblclick', userProcess.deleteUser);
        });
      }
    });
  },
  removeUserInDates: currDateKeys => {
    const currDate = `dates/${currDateKeys.yearMonthKey}/${currDateKeys.dateKey}`;

    database.ref(currDate).once('value', snapshot => {
      const dayOffUsers = snapshot.val();

      if (dayOffUsers) {
        delete dayOffUsers[userProcess.selectedUser.userKey];
        if (Object.keys(dayOffUsers).length) {
          database.ref(currDate).set(dayOffUsers);
        } else {
          database.ref(currDate).remove();
        }
      }
    });
  },
  removeDateInUser: currDatekeys => {
    const currMonthDayOfDate = `users/${userProcess.selectedUser.userKey}/dayOffDates/${currDatekeys.yearMonthKey}`;

    database.ref(currMonthDayOfDate).once('value', snapshot => {
      const dayOffDateData = snapshot.val();
      
      if (dayOffDateData) {
        delete dayOffDateData[currDatekeys.dateKey];
        if (Object.keys(dayOffDateData).length) {
          database.ref(currMonthDayOfDate).set(dayOffDateData);
        } else {
          database.ref(currMonthDayOfDate).remove();
        }    
      }
      
    });
  },
  putUserInDates: currDatekeys => {
    const currDateUsers = `dates/${currDatekeys.yearMonthKey}/${currDatekeys.dateKey}`;
    const userValue = `${userProcess.selectedUser.userName}-${userProcess.selectedUser.userColor}`;

    database.ref(currDateUsers).once('value', snapshot => {
      const usersData = snapshot.val();

      if (usersData) {
        usersData[userProcess.selectedUser.userKey] = userValue;
        database.ref(currDateUsers).set(usersData);
      } else {
        database.ref(currDateUsers).update({
          [userProcess.selectedUser.userKey]: userValue
        });
      }
    });
  },
  putDateInUserData: currDatekeys => {
    const currMonthDayOfDate = `users/${userProcess.selectedUser.userKey}/dayOffDates/${currDatekeys.yearMonthKey}`;

    database.ref(currMonthDayOfDate).once('value', snapshot => {
      const monthDayOfDate = snapshot.val();

      if (monthDayOfDate) {
        monthDayOfDate[currDatekeys.dateKey] = true;
        database.ref(currMonthDayOfDate).set(monthDayOfDate);
      } else {
        database.ref(currMonthDayOfDate).update({
          [currDatekeys.dateKey]: true
        });
      }
    });
  },
  putSelectedColor: (userKey, userColor) => { 
    database.ref('selectedColor').once('value', snapshot => {
      const selectedColor = snapshot.val();
     
      if (selectedColor) {
        selectedColor[userColor] = userKey;
        database.ref('selectedColor').update(selectedColor);
      } else {
        database.ref('selectedColor').update({[userColor]: userKey});
      }
    });
  },
  putUser: (userkey, userName, userColor) => {
    const userData = {
      userName,
      userColor
    }
    database.ref(`users/${userkey}`).update(userData);
  }
}

const modalsProcess = {
  resetContent: () => {
    const modalContents = [modalMessage, modalUserInput, modalBtns];

    modalContents.forEach(content => {
      while (content.firstChild) {
        content.firstChild.remove();
      }
    });
  },
  openModal: () => {
    modal.classList.remove('hidden');
    modalOverlay.addEventListener('click', e => {
      if (e.target === e.currentTarget) {
        modalsProcess.resetContent();
        modal.classList.add('hidden');
      }
    });
  },
  closeModal: () => {
    modalsProcess.resetContent();
    modal.classList.add('hidden');
  },
  warningMessage: {
    userCount: () => {
      modalsProcess.resetContent();

      const warningMessage = document.createElement('h2');
      const closeBtn = document.createElement('button');

      closeBtn.classList.add('modalBtn-design');

      document.querySelector('.message').appendChild(warningMessage);
      modalBtns.appendChild(closeBtn);

      warningMessage.innerText = '인원은 5명을 초과할 수 없습니다';
      closeBtn.innerText = '확인';
      closeBtn.addEventListener('click', modalsProcess.closeModal);
    },
    userName: () => {
      modalsProcess.resetContent();

      const warningMessage = document.createElement('h2');
      const returnAddUserBtn = document.createElement('button');
      const closeBtn = document.createElement('button');

      returnAddUserBtn.classList.add('modalBtn-design');
      closeBtn.classList.add('modalBtn-design');

      document.querySelector('.message').appendChild(warningMessage);
      document.querySelector('.btns').appendChild(returnAddUserBtn);
      modalBtns.appendChild(closeBtn);

      warningMessage.innerText = '이름을 1 ~ 5 자리로 입력 해주세요';
      returnAddUserBtn.innerText = '다시 생성';
      closeBtn.innerText = '닫기';

      returnAddUserBtn.addEventListener('click', () => {
        modalsProcess.resetContent();
        userProcess.addUser();
      });
      closeBtn.addEventListener('click', () => {
        modalsProcess.resetContent();
        modalsProcess.closeModal();
      });
    }
  }
}

const userProcess = {
  selectedUser: {
    userName: null,
    userKey: null,
    userColor: null
  },
  deleteUserAllData: () => {
    const targetUser = userList.querySelector(`.userKey-${userProcess.selectedUser.userKey}`);
    const currMonthUserDayOffs = dates.querySelectorAll(`.userKey-${userProcess.selectedUser.userKey}`);
    
    databaseProcess.deleteUserColor();
    databaseProcess.deleteUserDayOff();
    userList.removeChild(targetUser);
    modalsProcess.closeModal();

    if (currMonthUserDayOffs.length) {
      for (let i = 0; i < currMonthUserDayOffs.length; i++) {
        currMonthUserDayOffs[i].parentNode.removeChild(currMonthUserDayOffs[i]);
      }
    }
  },
  deleteUser: user => {
    modalsProcess.openModal();

    const removeUserMessage = document.createElement('h2');
    const additionalMessage = document.createElement('span');
    const removeBtn = document.createElement('button');
    const closeBtn = document.createElement('button');
    const currSelectedUser = user.currentTarget;

    removeBtn.classList.add('modalBtn-design');
    closeBtn.classList.add('modalBtn-design');

    userProcess.selectedUser.userKey = currSelectedUser.classList.item(0).split('-')[1];
    userProcess.selectedUser.userColor = currSelectedUser.classList.item(1).split('-')[1];
    userProcess.selectedUser.userName = currSelectedUser.firstChild.innerHTML;

    modalMessage.appendChild(removeUserMessage);
    modalMessage.appendChild(additionalMessage);
    modalBtns.appendChild(removeBtn);
    modalBtns.appendChild(closeBtn);

    removeUserMessage.innerText = '유저를 삭제하시겠습니까?';
    additionalMessage.innerText = '* 삭제할 유저의 모든 데이터가 사라집니다';
    removeBtn.innerText = '삭제';
    closeBtn.innerText = '닫기';

    removeBtn.addEventListener('click', userProcess.deleteUserAllData);
    closeBtn.addEventListener('click', modalsProcess.closeModal);
  },
  selectUserHandler: user => {
    const currSelectUser = user.currentTarget;
    const currSelectUserKey = currSelectUser.classList.item(0).split('-')[1];
    const currSelectUserColor = currSelectUser.classList.item(1).split('-')[1];

    if (userProcess.selectedUser.userKey === currSelectUserKey) {
      currSelectUser.classList.remove('selected-user');
      userProcess.selectedUser.userName = null;
      userProcess.selectedUser.userKey = null;
      userProcess.selectedUser.userColor = null;
      calenderProcess.calenderEvents.clickEventHandler('remove');
    } else {
      if (userProcess.selectedUser.userKey) {
        userList.querySelector(`.userKey-${userProcess.selectedUser.userKey}`).classList.remove('selected-user');
      } else {
        calenderProcess.calenderEvents.clickEventHandler('add');
      }
      currSelectUser.classList.add('selected-user');
      userProcess.selectedUser.userKey = currSelectUserKey;
      userProcess.selectedUser.userName = currSelectUser.firstChild.innerHTML;
      userProcess.selectedUser.userColor = currSelectUserColor;
    }
  },
  userListUp: async () => {
    const newUser = document.createElement('div');
    const newUserName = document.createElement('span');
    const userKey = Math.random().toString(36).substr(2, 11);
    const inputUserName = document.querySelector('.inputUserName').value;

    newUser.classList.add(`userKey-${userKey}`);

    newUserName.innerText = inputUserName;
    userList.appendChild(newUser);
    newUser.appendChild(newUserName);

    newUser.addEventListener('click', e => {
      userProcess.selectUserHandler(e);
    });
    newUser.addEventListener('dblclick', userProcess.deleteUser);

    modalsProcess.closeModal();
    
    //리팩토링 필요
    await utils.selectColor().then(userColor => {
      newUser.classList.add(`userColor-${userColor}`);
      newUser.classList.add('user');
      databaseProcess.putUser(userKey, inputUserName, userColor);
      databaseProcess.putSelectedColor(userKey, userColor);
    });
  },
  addUserCheck: () => {
    const inputUSerName = document.querySelector('.inputUserName');

    if (inputUSerName.value.length === 0 || inputUSerName.value.length > 5) {
      modalsProcess.warningMessage.userName();
    } else if (userList.childElementCount === 5) {
      modalsProcess.warningMessage.userCount();
    } else {
      userProcess.userListUp();
    }
  },
  addUser: () => {
    modalsProcess.openModal();

    const addUserMessage = document.createElement('h2');
    const inputUserName = document.createElement('input');
    const addBtn = document.createElement('button');
    const closeBtn = document.createElement('button');

    inputUserName.classList.add('inputUserName');
    addBtn.classList.add('modalBtn-design');
    closeBtn.classList.add('modalBtn-design');

    modalMessage.appendChild(addUserMessage);
    modalUserInput.appendChild(inputUserName);
    modalBtns.appendChild(addBtn);
    modalBtns.appendChild(closeBtn);

    addUserMessage.innerText = '이름을 입력 해주세요';
    addBtn.innerText = '추가';
    closeBtn.innerText = '닫기';

    inputUserName.addEventListener('keyup', e => {
      if (e.keyCode === 13) {
        userProcess.addUserCheck();
      }
    });
    addBtn.addEventListener('click', userProcess.addUserCheck);
    closeBtn.addEventListener('click', modalsProcess.closeModal);
  }
}

const calenderProcess = {
  currDate: new Date(),
  calenderEvents: {
    onEvent: e => {
      const clickedDate = e.currentTarget;
      const dateNum = clickedDate.querySelector('.date-num').innerHTML;
      const currDatekeys = calenderProcess.createCurrDateKey(dateNum);
      const dateUserList = clickedDate.querySelector('.date-userList');
      const userKey = `userKey-${userProcess.selectedUser.userKey}`;
      let hasSameUser = false;

      for (let i = 0; i < dateUserList.childNodes.length; i++) {
        if (dateUserList.childNodes[i].classList.contains(userKey)) {
          hasSameUser = true;
        }
      }

      if (hasSameUser) {
        const targetUser = dateUserList.querySelector(`.${userKey}`);
        dateUserList.removeChild(targetUser);

        databaseProcess.removeDateInUser(currDatekeys);
        databaseProcess.removeUserInDates(currDatekeys);
      } else {
        const user = document.createElement('div');
        const userName = document.createElement('span');

        user.classList.add(userKey);
        userName.classList.add('user-name');
        userName.classList.add(`userColor-${userProcess.selectedUser.userColor}`)
        userName.innerText = userProcess.selectedUser.userName;
        dateUserList.appendChild(user);
        user.appendChild(userName);

        databaseProcess.putDateInUserData(currDatekeys);
        databaseProcess.putUserInDates(currDatekeys);
      }
    },
    clickEventHandler: action => {
      for (let i = 0; i < dates.childNodes.length; i++) {
        if (!dates.childNodes[i].classList.contains('emptyDate')) {
          if (action === 'add') {
            dates.childNodes[i].addEventListener('click', calenderProcess.calenderEvents.onEvent);
            dates.childNodes[i].classList.add('haveEvent');
          } else {
            dates.childNodes[i].removeEventListener('click', calenderProcess.calenderEvents.onEvent);
            dates.childNodes[i].classList.remove('haveEvent');
          }
        }
      }
    },
  },

  createCurrDateKey: dateNum => {
    const currYear = calenderProcess.currDate.getFullYear();
    const currMonth = calenderProcess.currDate.getMonth() + 1;
    return {
      YearMonthDateKey: `${currYear}-${currMonth}-${dateNum}`,
      yearMonthKey: `${currYear}-${currMonth}`,
      dateKey: dateNum,
    }
  },
  viewCurrMonth: () => {
    currMonth.innerText = `${calenderProcess.currDate.getFullYear()} 년 ${calenderProcess.currDate.getMonth() + 1}월`
  },
  resetUserInCalender: () => {
    for (let i = 0; i < dates.childNodes.length; i++) {
      const cuurDateUserList = dates.childNodes[i].querySelector('.date-userList');
      while (cuurDateUserList.firstChild) {
        cuurDateUserList.firstChild.remove();
      }
    }
  },
  monthHandler: () => {
    calenderProcess.resetUserInCalender();
    if (event.target.className === 'nextMonthBtn') {
      calenderProcess.currDate.setMonth(calenderProcess.currDate.getMonth() + 1);
    } else {
      calenderProcess.currDate.setMonth(calenderProcess.currDate.getMonth() - 1);
    }
    calenderProcess.dateCulculation();
    databaseProcess.getCurrMonthCalender();
  },
  viewCalender: dateCulData => {
    const dateNodes = dates.childNodes;
    let viewDate = 1;
    let viewDay = dateCulData.firstDay;

    // 선택 유저 있으면 이전 달 이벤트 지지우고, 다음달 이벤트 생성 코드 리팩토링
    if (userProcess.selectedUser.userKey) {
      calenderProcess.calenderEvents.clickEventHandler('remove');
    }

    for (let i = 0; i < dates.childElementCount; i++) {
      dateNodes[i].removeAttribute('class');

      if (dateCulData.firstDay <= i && dateCulData.lastDate >= viewDate) {
        dateNodes[i].classList.add(`date-${viewDate}`);
        dateNodes[i].querySelector('.date-num').innerText = viewDate;
        viewDate++;
        
        if (viewDay === 6) {
          dateNodes[i].querySelector('.date-num').classList.add('day-sat')
          viewDay = 0;
        } else {
          if (viewDay === 0) {
            dateNodes[i].querySelector('.date-num').classList.add('day-sun')
          }
          viewDay++;
        }
      } else {
        dateNodes[i].classList.add('emptyDate');
        dateNodes[i].querySelector('.date-num').innerText = '';
      }
    }

    if (userProcess.selectedUser.userKey) {
      calenderProcess.calenderEvents.clickEventHandler('add');
    }

    calenderProcess.viewCurrMonth();
  },
  dateCulculation: () => {
    calenderProcess.currDate.setDate(1);

    const dateCulData = {
      firstDay: calenderProcess.currDate.getDay(),
      lastDate: new Date(calenderProcess.currDate.getFullYear(), calenderProcess.currDate.getMonth() + 1, 0).getDate()
    }
    calenderProcess.viewCalender(dateCulData);
  }
}
calenderProcess.dateCulculation();
databaseProcess.getUserData();
databaseProcess.getCurrMonthCalender();

backMonthBtn.addEventListener('click', calenderProcess.monthHandler);
nextMonthBtn.addEventListener('click', calenderProcess.monthHandler);
addUserBtn.addEventListener('click', userProcess.addUser);
