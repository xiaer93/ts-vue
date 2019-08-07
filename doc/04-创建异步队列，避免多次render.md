1. 如何提高性能？
2. 1. dep和watch不添加重复对象
3. 2. 将所有的watch推入异步队列queueWatch中执行，重复watch只执行一次


        // fixme: 如何优化性能？
        // 1. 如何避免数组多次收集依赖，dep和watch不存储重复对象
        // 2. 将watch推入队列，异步执行（相同watch不重复推入）