export interface Post {
  replies: Reply[];
  open: boolean;
  data: {
    score: number;
    title: string;
    username: string;
  };
}

export interface Reply {
  replies: Reply[];
  path: number[];
  parent?: Reply;
  open: boolean;
  show: boolean;
  data: {
    score: number;
    body: string;
    username: string;
  };
}

export interface ReplyReference {
  score: number;
  path: number[];
}
