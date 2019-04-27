import {Post, Reply, ReplyReference} from '../models';

export class DataCenterService {
  post: Post;
  postLink: string;
  referenceArray: ReplyReference[];
  currentIndex = 0;
  console = console.log;

  constructor() {
    this.post = {
      replies: [],
      open: false,
      data: {
        score: 0,
        title: '',
        username: '',
      },
    };
    this.referenceArray = [];
  }

  getPosts(url) {
    this.postLink = url;
    fetch(url + '.json', { mode: 'cors' })
    .then(x => x.json()).then(data => {

      const post = data[0].data.children[0].data;
      const replies = data[1].data.children;

      this.currentIndex = 0;
      this.referenceArray = [];
      this.post.replies = [];
      this.post.open = false;
      this.post.data = {
        score: post.score,
        title: post.title,
        username: post.author,
      };

      this.getComments(this.post.replies, replies);
    });
  }

  getComments(destination: Reply[], rawReplies: any[], parent: Reply = null) {
    let index = 0;
    const open = false;
    const show = false;
    rawReplies.forEach(reply => {
      if (reply.kind === 't1') {
        const path = parent ? [...parent.path, index++] : [index++];
        const comment: Reply = {
          replies: [],
          path, parent, open, show,
          data: {
            score: reply.data.score,
            body: reply.data.body,
            username: reply.data.author,
          },
        };
        destination.push(comment);
        this.referenceArray.push({
          score: comment.data.score,
          path: comment.path,
        });
        if (reply.data.replies) {
          this.getComments(comment.replies, reply.data.replies.data.children, comment);
        }
      } else if (reply.kind === 'more') {
        reply.data.children.forEach(async id => {
          const fetchedReply = await this.getAReply(id);
          const path = parent ? [...parent.path, index++] : [index++];
          const comment: Reply = {
            replies: [],
            path, parent, open, show,
            data: {
              score: fetchedReply.data.score,
              body: fetchedReply.data.body,
              username: fetchedReply.data.author,
            },
          };
          destination.push(comment);
          this.referenceArray.push({
            score: comment.data.score,
            path: comment.path,
          });
          if (fetchedReply.data.replies) {
            this.getComments(comment.replies, fetchedReply.data.replies.data.children, comment);
          }
        });
      }
    });
  }

  navigateToNext() {
    if (this.currentIndex >= 0) {
      const path = this.referenceArray[this.currentIndex].path;
      let reply: any = this.post;
      path.forEach(index => {
        reply.open = false;
        reply = reply.replies[index];
        reply.show = false;
      });
    }
    if (this.referenceArray.length > this.currentIndex) {
      const path = this.referenceArray[++this.currentIndex].path;
      let reply: any = this.post;
      path.forEach(index => {
        reply.open = true;
        reply = reply.replies[index];
        reply.show = true;
      });
    }
  }

  async getAReply(id) {
    let comment = {};
    let dataFound = false;
    while (!dataFound) {
      await fetch(this.postLink + '/' + id + '.json', { mode: 'cors' })
        .then(x => x.json()).then(B => comment = B);
      dataFound = comment[1].data.children[0];
    }
    return comment[1].data.children[0];
  }

  sortReference() {
    this.referenceArray.sort((a, b) => a.score - b.score);
  }
}
