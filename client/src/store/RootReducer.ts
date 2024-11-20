import { combineReducers } from "@reduxjs/toolkit";
import { GameReducer } from "./GameReducer";

export const RootReducer = combineReducers({
	'gameReducer': GameReducer.reducer,
});