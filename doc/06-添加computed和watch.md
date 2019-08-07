1. computed特性，添加data和props的watch，并为自己创建依赖；数据更新后触发computed（具有缓存特性，提高性能能）
2. watch，监听某个依赖，数据变化后执行watch


1. Proxy，receiver是干撒的？为什么会影响Reflect.set的结果？？？
2. vm.news = [1,2]，新设对象如何继续添加依赖？


观察vue源码，调整逻辑。