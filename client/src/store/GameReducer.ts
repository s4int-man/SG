import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { IPlayer } from "../types/IProgress";
import { IGame } from "../types/IGame";
import { IQuestion } from "../types/IQuestion";

interface IGameState
{
	players: IPlayer[];
	progress: IGame;
	currentRound: number;
	currentQuestion: IQuestion | null;
}

function setPlayers(state: IGameState, action: PayloadAction<IPlayer[]>): void
{
	state.players = action.payload;
}

function setProgress(state: IGameState, action: PayloadAction<IGame>): void
{
	state.progress = action.payload;
}

function setSelectedQuestion(state: IGameState, action: PayloadAction<IQuestion>): void
{
	state.currentQuestion = action.payload;
}

export const GameReducer = createSlice({
	name: "game",
	initialState: {
        players: [],
		progress: { rounds: [] },
		currentRound: 0,
		currentQuestion: null,
    },
	reducers: {
		setPlayers,
		setProgress,
		setSelectedQuestion,
	}
});