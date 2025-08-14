export interface User {
  username: string;
  hand: string[];
  points: number;
}

export interface UserScore {
    username: string;
    points: number;
}

export type UserList = UserScore[];

export interface CardOnTable {
    cardContent: string;
    revealed: boolean;
}

export interface WebSocketMessage {
    type: string;
    payload: any;
}
