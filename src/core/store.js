import {createStore} from "redux";

export const actionLogin = (user)=>{
    return {
        type: LOGIN,
        data: user
    }
};
export const actionLogout = () => {
    return {
        type: LOGOUT
    }
};

const initialState = {
    isLogin: false,
    user: null
};
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export function loginReducer(prev = initialState, action) {
    switch (action.type) {
        case LOGIN:
            return {...prev, isLogin: true, user: action.data};
        case LOGOUT:
            return initialState;
        default:
            return initialState;
    }
}

export const store =  createStore(loginReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());