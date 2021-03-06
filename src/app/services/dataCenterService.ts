import {Post, Reply, ReplyReference} from '../models';

export class DataCenterService {
  post: Post;
  postLink: string;
  referenceArray: ReplyReference[];
  currentIndex = -1;
  console = console.log;
  loadingString;
  prevPostLength = 0;
  interval;
  sortBy = 'none';

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

  async getPost(url) {
    this.loadingString = 'Fetching Post';
    this.postLink = url.substring(0, url.length - 1);
    await fetch(this.postLink + '.json', { mode: 'cors' })
    .then(x => x.json()).then(async data => {

      const post = data[0].data.children[0].data;
      const replies = data[1].data.children;

      this.sortBy = 'none';
      this.currentIndex = -1;
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
    this.loadingString = 'Fetching additional comments';
    this.prevPostLength = 0;
    this.interval = setInterval(() => {
      if (this.prevPostLength < this.post.replies.length) {
        this.prevPostLength = this.post.replies.length;
        this.loadingString += ' .';
      } else {
        clearInterval(this.interval);
        this.interval = null;
        this.loadingString = '';
      }
    }, 1000);
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
        // if (!reply.data.score_hidden)
          this.referenceArray.push({
            score: comment.data.score,
            path: comment.path,
            replies: comment.replies.length,
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
          // if (!fetchedReply.data.score_hidden)
            this.referenceArray.push({
              score: comment.data.score,
              path: comment.path,
              replies: comment.replies.length,
            });
          if (fetchedReply.data.replies) {
            this.getComments(comment.replies, fetchedReply.data.replies.data.children, comment);
          }
        });
      }
    });
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

  closeCurrent() {
    if (this.currentIndex > -1) {
      const path = this.referenceArray[this.currentIndex].path;
      let reply: any = this.post;
      path.forEach(index => {
        reply.open = false;
        reply = reply.replies[index];
        reply.show = false;
      });
      if (this.sortBy === 'replies') {
        reply.open = false;
        reply.replies.forEach(r => r.show = false);
      }
    }
  }

  navigateToNext() {
    this.closeCurrent();
    this.currentIndex++;
    if (this.referenceArray.length > this.currentIndex) {
      const path = this.referenceArray[this.currentIndex].path;
      let reply: any = this.post;
      path.forEach(index => {
        reply.open = true;
        reply = reply.replies[index];
        reply.show = true;
      });
      if (this.sortBy === 'replies') {
        reply.open = true;
        reply.replies.forEach(r => r.show = true);
      }
    } else {
      alert('Oops! Looks like you have viewed every last reply!');
    }
  }

  sort(type) {
    this.closeCurrent();
    this.sortBy = type;
    this.currentIndex = -1;
    switch (type) {
      case 'best':
        this.referenceArray.sort((a, b) =>  b.score - a.score);
        break;
      case 'worst':
        this.referenceArray.sort((a, b) =>  a.score - b.score);
        break;
      case 'replies':
        this.referenceArray.sort((a, b) => b.replies - a.replies);
        break;
      case 'depth':
        this.referenceArray.sort((a, b) => b.path.length - a.path.length);
        break;
    }
  }

  reset() {
    this.closeCurrent();
    this.currentIndex = -1;
  }
}
