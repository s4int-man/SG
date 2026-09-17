import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IGame } from "../types/IGame";
import { IPlayer } from "../types/IProgress";
import { IQuestion, ISelectedQuestion } from "../types/IQuestion";

interface IGameState
{
	players: IPlayer[];
	progress: IGame;
	currentRound: number;
	currentQuestion: IQuestion | null;
	selectedQuestion: ISelectedQuestion | null;
	answerPlayer: IPlayer | null;
	answerQueue: string[];
	leaderPlayer?: string;
	catInBagSelected: boolean;
}

const initialState: IGameState = {
	players: [],
	progress: { rounds: [] },
	currentRound: 0,
	selectedQuestion: null,
	currentQuestion: null,
	answerPlayer: null,
	answerQueue: [],
	leaderPlayer: undefined,
	catInBagSelected: false,
};

function setPlayers(state: IGameState, action: PayloadAction<IPlayer[]>): void
{
	action.payload.sort((a, b) => a.score - b.score);
	state.players = action.payload;
}

function setProgress(state: IGameState, action: PayloadAction<IGame>): void
{
	state.progress = action.payload;
}

function setSelectedQuestion(state: IGameState, action: PayloadAction<ISelectedQuestion | null>): void
{
	state.selectedQuestion = action.payload;
}

function setCurrentQuestion(state: IGameState, action: PayloadAction<IQuestion | null>): void
{
	state.currentQuestion = action.payload;
}

function setCurrentRound(state: IGameState, action: PayloadAction<number>): void
{
	state.currentRound = action.payload;
}

function setAnswerPlayer(state: IGameState, action: PayloadAction<string | null>): void
{
	if (action.payload == null)
	{
		state.answerPlayer = null;
		return;
	}

	const player = state.players.find(p => p.name === action.payload);
	state.answerPlayer = player ?? { name: action.payload, score: 0, online: true };
}

function setAnswerQueue(state: IGameState, action: PayloadAction<string[]>): void
{
	state.answerQueue = action.payload;
}

function setLeaderPlayer(state: IGameState, action: PayloadAction<string | undefined>): void
{
	state.leaderPlayer = action.payload;
}

function setCatInBagSelected(state: IGameState, action: PayloadAction<boolean>): void
{
	state.catInBagSelected = action.payload;
}

export const GameReducer = createSlice({
	name: "game",
	initialState,
	reducers: {
		setPlayers,
		setProgress,
		setSelectedQuestion,
		setCurrentQuestion,
		setAnswerPlayer,
		setAnswerQueue,
		setCurrentRound,
		setLeaderPlayer,
		setCatInBagSelected,
	}
});
