/* eslint-disable import/no-extraneous-dependencies */
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import combineReducers from './reducers.js';

const store = createStore(combineReducers, composeWithDevTools(applyMiddleware(thunkMiddleware))); // The second parameter is thunk middleware, which is used to handle the function type of action

export default store;
