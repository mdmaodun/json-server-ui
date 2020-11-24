Promise.delayResolve = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
Promise.delayReject = (ms, reason) => new Promise((resolve, reject) => setTimeout(() => reject(reason), ms));
