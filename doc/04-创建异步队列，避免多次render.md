1. 如何提高性能？
2. 1. dep和watch不添加重复对象
3. 2. 将所有的watch推入异步队列queueWatch中执行，重复watch只执行一次