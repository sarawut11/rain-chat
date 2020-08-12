/* eslint-disable no-unused-vars */
import * as qiniu from 'qiniu-js';

export default async function upload(file, uploadToken, completeEvent) {
  // subscription.unsubscribe(); // Upload canceled
  const observer = {
    next() {
      // // console.log('qiniu observer next', res);
    },
    error(err) {
      // // console.log('qiniu observer err', err);
      return err;
    },
    complete(res) {
      // // console.log('qiniu observer complete', res);
      const fileUrl = `https://cdn.aermin.top/${res.key}`;
      completeEvent(fileUrl);
    },
  };

  const config = { useCdnDomain: true };
  const putExtra = {};
  const { userId } = JSON.parse(localStorage.getItem('userInfo'));
  const key = `${userId}_${new Date().getTime()}_${file.name}`;
  const observable = qiniu.upload(file, key, uploadToken, putExtra, config);
  const subscription = observable.subscribe(observer); // Upload starts
}
