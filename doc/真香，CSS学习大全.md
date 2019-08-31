# 精通css

> 主要为读书笔记，也有日常总结的css技巧

## css编写原则

1. 分离css和html的关注点：html负责标签，css负责样式

2. 关注html语义化，便于阅读，便于爬虫（seo）

 - 不要使用font等样式标签
 - 使用h5的结构标签，header、footer、nav、section等
 - div和span是非语义化标签，被用作钩子绑定class类名，添加样式
 - i和b标签，仅仅表示斜体和加粗，而em和strong有强调的语义，应该尽量使用后者
 - 好的语义化标准：去掉css样式，文档能够正常阅读
 - ie9支持所有h5标签（额，暂未验证！）

3. **最小的颗粒是组件/函数**，方便复用（Small pieces, loosely joined）

```css
  // 清除浮动函数
  .cf:before, .cf:after { content: " "; display: table; }
  .cf:after { clear: both; }
  .cf { *zoom: 1; }
```

4. 渐进增强：浏览器遇到无法识别的属性时候会自动丢掉

    - `<input type="email" />`，如果浏览器不支持email类型，则自动回退到默认值text
    - css设定`background: #000; background: rgba(0,0,0,1)`，如果浏览器不支持rgba，则会自动丢弃rgba样式

5. 私有属性：先私有后标准

```css
  webkit-box-shadow: 0px 5px 15px #EFEFEF;
  box-shadow: 0px 5px 15px #EFEFEF;
```

6. 检测是否支持属性@supports（笔者尚未在实际中应用）

```css
  @supports(display: grid){
      如果支持grid，则下述css讲作用。
  }
```

7. css模块化

- 命名模块化：BEM、OOCSS、SMACSS
- css in js：在js中写样式，采用行内样式（style），不需要查询类
- css modules：通过生成独一无二的类名，避免外部样式污染、内部样式泄露

8. css优化：压缩/减少请求次数/尽可能提前早的加载

link引用CSS，会并行下载；@import引入，会依次下载

9. 渐进式增强和优雅降级

- 优雅降级，针对高级浏览器设计网站，后期对于“过时”浏览器进行降级调整。
- 渐进增强，以基础版本开始，不断扩充。

## css基础

### 选择器类型

- 标签：`div{}`
- ID:`#app{}`
- class: `.banner{}`
- 通配符：`*{}`
- 子代：`p > span{}`，
- 兄弟[~ +]：`li + li{}`
- 后代：`p span{}`
- 分组：`html,body{}`
- 属性：`input[type="radio"]{}`
- 伪元素（::after）：`div::after{clear: both}`
- 伪类（:hover,focus,active,first-child,nth-of-child）：`a:hover{}`

补充说明下，选择器的妙用：

- `nth-child(-n + 3)` 只选中前3个元素，[更多案例](https://alistapart.com/article/quantity-queries-for-css)
- form表单新增伪类选择器，`input:required，input:optional，input[type="email"]:valid，input[type="email"]:invalid， input-number:in-range, input:read-only`
- [纯css实现的star](xxx某掘金地址)

### 选择器等级

- 行内样式大于引入样式：`<p style="color: red;"></p>  >>>  style/link`
- 后来居上：`p{color: red;}  <<<  p{color: yellow;}`
- important会提高等级：`.app .banner{color: red}  <<< .banner{color: yellow !important;}`
- 在写a标签伪类样式时，应该遵循:link，:visited，:hover，:focus，:active顺序，因为选择器等级相同
- 选择器等级计算表
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6970da1a6f73?w=430&h=235&f=png&s=24808)

### 继承和层叠

- 默认继承属性：font/table等样式
- 主动声明继承：inherit
- 层叠规则：从多条规则中选出有效的css样式。

```css
// 有继承性的属性
1、font字体，color、font-size等。
2、文本系列属性：text-indent、text-align、line-height、word-spacing、letter-spacing、text-transform、direction、color等。
3、表格属性：caption-side、border-spacing、border-collapse。
4、列表属性：list-style等。
5、所有元素可继承：visibility、cursor等。

// 无继承性的属性
1、display、width、padding、margin、float、position、max-height、overflow、z-index等等。
2、文本属性：vertical-align、text-decoration、text-shadow、white-space等。
3、背景属性：background等
4、轮廓样式：outline等。
5、清除浮动：clear等。
6、内容：content等。
```

### 文档流和盒模型

文档流、盒模型，控制着元素的排布。

- 正常文档流：自上到下，自左到右，依次排布
- 脱离文档流：float、position、fixed等元素，脱离正常文档流
- 盒模型：content、padding、border、margin、outline（outline不影响布局）
- box-sizing控制着应该如何计算一个元素的总宽度和总高度

如下面demo，定义了`padding: 20px; width:33.3%`，默认情况下会发生换行，如果设置`box-sizing:border-box;`，则`width = border + padding + 内容的宽度`

![](https://user-gold-cdn.xitu.io/2019/8/31/16ce69d793b76eb5?w=434&h=290&f=png&s=14607)

- margin边距叠加

元素在排布是，margin会发生叠加现象，具体说来：兄弟外边距叠加，父子外边距叠加。

外边距叠加有利于文档的排布，但是有时候我们不想要这个效果，怎么办呢？

**浮动元素不与其他元素叠加，bfc不与子元素叠加，inline-block不与任何元素叠加**

![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6a2a7dd9d855?w=545&h=274&f=png&s=30012)
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6a2c58127ba2?w=566&h=194&f=png&s=25909)
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6a2e8506d1da?w=521&h=110&f=png&s=16097)
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6a2f88767f29?w=557&h=123&f=png&s=22676)

### 元素的包含块

若某元素`position:absolute; left: 50px;`，他的定位基准是谁？若某元素`width:100%`，它的计算基准元素是谁？

这里引出了一个重要概念---包含亏啊。包含块也会影响元素的布局，它决定了如何解释各种属性（如何计算值，及定位依据）？

1. 如何确定元素的包含块？

- html、body均为包含块
- 普通元素（realative/static/float），其包含块为父元素（块级元素、td、th）
- absolute定位元素，其包含块为position不为static的父元素，或者根元素
- fixed定位元素，其包含块为当前窗口或transform变化元素


2. 如何计算元素的属性值？

- 一般属性参照当前元素的包含块进行计算
- `transform: translate(10px, 0)`参照元素自身Border-box
- `position: relative`定位元素，其left/top参照自身，其余以父元素Content-box为基准
- `position: absolute`定位元素，以父元素Padding-box为基准

左侧图片的高度未知，你有办法让右侧p标签与img同高吗？（禁用flex、grid）[查看demo](https://codepen.io/xiaer/pen/dybzZOz)
```
<div class="box">
  <img class="left" src="xxx.jpg"/>
  <p class="right">hello world!</p>
</div>
```

### 层叠上下文

 层叠上下文和层叠顺序z-index
        》 创建新的层叠上下文，position:absolute并且z-index不为auto，transform和filter都可以创建层叠上下文，opacity设置透明度（透明度小于1）也可以创建层叠上下文？（下述图片讲解了层叠上下文和层叠顺序的关系）

### 浮动的特性

浮动元素会脱离文档流，为兼容ie9及以下浏览器，业务中经常需要使用浮动布局方案。

浮动效果，块元素和行内元素效果如下：
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6bdb0c0c34d1?w=542&h=220&f=png&s=28350)
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6bde37f16753?w=515&h=257&f=png&s=21324)

清除浮动是非常常见的需求，最佳清除浮动代码：

```css
.cf:before, .cf:after { content: " "; display: table; }
.cf:after { clear: both; }
.cf { *zoom: 1; }
```

### BFC & IFC

块级格式上下文和行内格式上下文也是非常重要的概念，影响着元素布局的效果。

1. 如何创建块级格式上下文？

根元素（html）、浮动元素、`absolute/fixed`定位元素、`inline-block`元素、overflow不为`visible`元素、flex的直接子元素、grid的直接子元素、`table-cell/table-caption/table-row/..`等

2. 如何创建行内格式上下文？

3. bfc应用： 浮动两栏布局
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6bdfc855808b?w=541&h=263&f=png&s=29902)

4. ifc应用：是否有过`display:inline-block`布局时，子元素没按预想中对齐？
 https://christopheraue.net/design/vertical-align
 [https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align](https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align)

- css3定义了关键字：contain-floats;，vue-cli脚手架开发中，可以使用这些cssnext属性吗，支持自动转换吗？

## 文本相关

### 排版属性

常用的文本排版属性：

`color、font-family、font-size、line-height、vertical-align、font-weight、font-style、text-transform、word-spacing、letter-spacing`

文本排版的技巧：

- 设置文本宽度为：` max-width: 36em; margin: 0 auto;`
- 设置段首空格：`p+p{text-indent: 1.25em}`
- 设置文本对齐方式：`text-align,left/right/center/justify/start/end`
- 针对英文连字符：`hyphens:auto`
- 多列文本排列，`columns`指定列数
- 多行文本要设置break-word属性，避免单词或数字不换行超出！

[单词不换行超出demo](https://codepen.io/xiaer/pen/BaBdmdv)，设定了宽度怎么文字还超出了？
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6d5c601be1d6?w=483&h=156&f=jpeg&s=10829)

### 自定义字体

自定义字体在图标上应用相当广泛，常用的图标字体网站[iconfont](https://www.iconfont.cn/)

定义字体的最佳兼容方案：
```css
@font-face {
    font-family: 'MyWebFont';
    src: url('webfont.eot'); /* IE9 Compat Modes */
    src: url('webfont.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
         url('webfont.woff') format('woff'), /* Modern Browsers */
         url('webfont.ttf')  format('truetype'), /* Safari, Android, iOS */
         url('webfont.svg#svgFontName') format('svg'); /* Legacy iOS */
    }
```

如果某天UI要求文本全部使用非默认字体，你可能需要有一定的心理准备。字体文件一般都相当的大，下载非常耗时。常见的解决方案：

- 借助JS实现平滑过渡：https://github.com/typekit/webfontloader
- 使用字蛛，减小字体文件体积：http://font-spider.org/

### 文字阴影

使用`text-shadow`可以设置非常漂亮的阴影效果，通过逗号可以同时设置多道阴影。

![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6e266efca870?w=534&h=342&f=png&s=66806)

大佬的艺术字教程推荐：https://practice.typekit.com/lesson/using-shades/

针对CSS无法实现的效果，可以使用JS
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6e54db3681ea?w=551&h=549&f=png&s=156912)

## 漂亮的盒子

### background属性

- background：`#000、rgb(0,0,0)、rgba(0,0,0,0.5)、hsl()`
- background-image：背景图片
- background-repeat: `repeat、no-repeat、space、round`，新增`background-repeat-x`
- background-image：`url(...)、linear-gradient(45deg, #cfdfee, #4164aa)`，支持路径图片，支持base64图片、支持渐变
- background-position：图片定位
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6eb1b391cec2?w=546&h=206&f=png&s=18138)
- background-clip，图片裁剪
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6ebe57708de9?w=564&h=153&f=png&s=136214)
- background-origin，图片左上角对齐方式
-backgroung-attachment：`local、scroll、fixed`，背景图片在视口内固定或者随着区块滚动
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6ed900171370?w=558&h=194&f=png&s=137749)
- background-size：`contain、cover`，背景图片大小
- background缩写： background: url(img/cat.jpg) 50% 50% / cover no-repeat padding-box content-box #bada55; 

background技巧？

1. background-image和img有什么区别？如何选取？

尽量使用背景图片，如果动态内容则使用img图片？

2. background支持多图背景

3. 常见的渐变纹理图片，http://lea.verou.me/css3patterns/


### border属性

- border-radius圆角
- border-image边框背景（IE10不支持）
- box-shadow美化, inset属性定义图片为投影面产生内嵌效果，多重投影

border技巧：

1. 各种css形状，如三角形...等

## 常用布局方案

水平布局和垂直布局是最常见的需求，实现方案非常多，我们一起探讨下

1. 水平布局

- float创建水平布局。浮动布局兼容性好
- inline-block水平布局，avatar+text是常见需求，如何创建更好的dom+css？？？ vertical-align对齐方式深入理解（https://christopheraue.net/design/vertical-align）？
- 使用vertical-align和text-align居中下列组件？（伪元素高度居中？）（块元素字体间距-.25em？？？）
- inline-block布局，元素之间有间隙，需要处理。父元素设定font-size:0???
- 另一种处理行内块元素的方案：https://matthewlein.com/articles/inline-block-fix
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce6ffb05782564?w=456&h=96&f=png&s=37427)
- table布局，table容器具有收缩适应特性，其宽度将为包含子元素最小宽度？需要手动设置width:100%
- 使用ul+li，配合table容器进行布局。。table布局有不好的地方，table-cell没有margin，不能使用position
- table布局另一个特性，可以垂直居中
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce700584120a34?w=554&h=203&f=png&s=19457)
    
2. 垂直布局

待补充案例

3. 布局方案对比

- 浮动兼容性好，可以多行布局，具有自适应宽度特性。但是：需要清除浮动，布局不依据源码顺序（left，right浮动）
- inline-block布局，可以多行布局，具有自适应宽度特性，但是：有块间距bug（可以解决）
- table布局兼容性好，可以垂直居中元素，但是：table-cell没有边距，不能重新排序？（类似于flex-order特性？）


## flex介绍

- 可以控制：元素尺寸（基于自身和有效剩余空间）；布局方向；对其方式，顺序
- 兼容至ie10，但是需要考虑私有属性（打包工具autoprefix自动补充前缀）
- 主轴和交叉轴。margin-auto的妙用
- flex-basis/base-grow/base-shrink，basis定义空间从而计算剩余空间量，grow定义对于剩余空间的分配比例（剩余空间按比例分配）。而shrink定义缩小规则（计算缩小尺寸公式：((500 × 1) / ((800 × 1) + (500 × 1))) * 300 = 115.4 ）。
- 缩写形式：flex: 1 0 0%;， grow-shrink-basis
- flex同样支持多行布局
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce700dfd159d53?w=554&h=356&f=png&s=24838)
- flex弹性盒模型兼容：1、浮动和清除属性，inline-block属性对于弹性盒模型没有影响，可以用来降级。2、https://modernizr.com/，3、support规则具体如何使用？？？

- flex有bug？https://github.com/philipwalton/flexbugs

    - 固定宽高比的元素如图像和视频，最好使用一个包裹元素。避免规范变化影响宽高比。
    - flex-order就像z-index决定这层叠等级，还可以单独设置z-index（如果设定，order将失效）

## grid介绍

## 栅格系统--响应式

- 先构思，避免陷入麻烦。模块化和组件化开发，布局页面？
- 整体布局思路：栅格布局？grid布局？
- 固定布局、流体布局、弹性布局：
    - 固定布局：施加特定尺寸的布局，如定宽布局
    - 弹性布局：ems中应用最常见？不理解
    - 流体布局：布局元素设定百分比，大小比例（间距）保持不变？栅格系统  https://www.theguardian.com/international

- 创建栅格的2种方式：col-1of4： 25%；  或者   row-quartet > * {25%}

- 页面整体布局和组件分离（布局和内容分离）

- 水槽宽度计算，可以设定百分比或者一个固定值。margin百分比相对于父元素宽度计算，em相对父元素字体计算
- row容器使用margin：0 -1%，负边距 消除 容器子元素左右2个变速的边距。
- 使用padding计算排水沟，效果更简单。
- 225，使用inline-block和flex增强布局？

- 传统方法基本都是从左到右进行布局，如何进行2d维度布局，grid

## 表单样式

业务中使用表单非常多

清除表单样式，`appearance: none; outline:none；border:none;`

### 响应式table

table的响应式变化，展示一下这种思路，[查看js库](https://www.filamentgroup.com/lab/tablesaw.html)

### 表单样式，fieldsets和legends

### input伪类选择器：focus,invalid,checked,target，placeholder等等

### 自定义checkbox


clip: rect(0 0 0 0)隐藏checkbox，使用label模拟选中框

![](https://user-gold-cdn.xitu.io/2019/8/31/16ce70221cb33685?w=553&h=193&f=png&s=24474)

```css
input[type="checkbox"]{
    position: absolute;
    overflow: hidden;
    width: 1px;
    height: 1px;
    clip: rect(0 0 0 0);
}

input[type="checkbox"] + label{}
input[type="checkbox"]:checked + label{}
input[type="checkbox"]:focus + label{}
input[type="checkbox"]:focus:checked + label{}
```

优秀的自定义checkbox案例：https://tympanus.net/Development/AnimatedCheckboxes/

### 自定义select

select样式无法自定义的修改，传统方案是使用div+span模拟实现，但是移动设备必须使用原生select标签！

- select2，js模拟实现
- 跨平台方案，纯css尽量抹平浏览器差异，https://www.filamentgroup.com/lab/select-css.html


## Transform和动画

### transform变化

transform支持2d和3d变化。transform会创建新的layer，配合css动画，性能卓越（but会消耗compose性能）

- 2d变化：translate、rotate、skew、scale、matrix
- 3d变化：transform3d、rotate3d
- 3d变化控制属性：perspective、perspective-origin、backface-visibility、transform-style
- transform-origin控制变化中心点
- transform会创建新的层叠上下文，会创建新的视口（position：fixed将以它作为新的参考）
- 创建transform动画，建议定义初始值，避免动态添加）
- transform案例：[transform-skew变化特效](https://codepen.io/xiaer/pen/KYRaPG)
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce70292dd3f819?w=330&h=307&f=png&s=61073)

### transition动画

transition定义过度动画，即属性变化动画

- transition: box-shadow .15s, transform .15s;
- 动画函数transition-timing-function： http://cubic-bezier.com
- 可动画属性：http://oli.jp/2010/css-animatable-properties/
- 支持帧动画

![](https://user-gold-cdn.xitu.io/2019/8/31/16ce703950837218?w=354&h=130&f=png&s=9502)
- 控制transition帧动画，单向运动，不做
反向动画(反向运动时长为0或者无穷大)

![](https://user-gold-cdn.xitu.io/2019/8/31/16ce703b2f2a923c?w=279&h=91&f=png&s=5789)
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce703c13dbc7bc?w=332&h=87&f=png&s=6045)
- height属性动画，值必须为number（动态高度使用max-height）：[内容高度动画](https://codepen.io/xiaer/pen/qzqQjb)


### animation动画

> animation定义帧动画，通过定义关键帧实现复杂的动画形式

- animation-delay定义动画何时开始
- animation-direction指示动画是否反向播放
- animation-duration动画周期时长
- animation-fill-mode设置CSS动画在执行之前和之后如何将样式应用于其目标：[效果演示](https://codepen.io/xiaer/pen/YopRmE)
- animation-iteration-count定义动画循环次数
- animation-play-state定义动画播放暂停
- animation-timing-function定义动画的执行节奏

### 迪士尼动画十二法则

> 理解还不够深刻，此处就不粘贴了。

### 60fps（提高动画性能）

- css动画性能，主要取决于重排重绘时间。[查询哪些属性影响重排重绘](https://csstriggers.com/)
- css动画的js只在开始时计算一次，运行时不再有js计算
- js动画使用requestAnimationFrame，而不要setTimeout
- `transfrom: translateZ(0);`会创建新的Layer，避免重绘
- 文章推荐：[H5动画60fps之路](https://weibo.com/p/1001603865643593165786)


## 响应式web设计

响应式设计并不仅局限于改变布局，通过媒体查询可以相当精确地对页面进行重构：小屏幕扩大选择区/元素的显示隐藏/改变字体大小和行距等，从而提高阅读体验

### 响应式和分离式

- 分离式网站：pc和移动两套代码，提供差异化的体验，但是需要维护两套代码
- 响应式网站：pc和移动使用一套代码，省时省力，SEO好。但是使用两组js操作同一个dom非常麻烦，比较难以精确控制，由于增加了脚本和样式的代码量（可能影响性能）

### 响应式3要素

- 流动网格（弹性网格布局）：根据视窗的百分比设定容器的宽度，从而使容器在浏览器窗口大小变化时自动缩放
- 媒体查询：基于显示设备的物理特性来调用不同的样式表，如尺寸、分辨率（`@media all (max-width: 320x)`）
- 响应图片：设置图像所占宽度至多为设备的最大宽度（max-width），同时针对分辨率选取最佳图片

### 视口概念

> 早期苹果为了手机能够显示pc页面，引入视口概念。视口影响着页面的显示效果，可以使用viewport对视口进行控制，width=device-width设定布局视口等于理想视口。

- 布局视口（layout viewport）：iOS、安卓默认的布局视口为980px
- 可视视口（visual viewport）：物理屏幕的可视区域，可以使用window.innerWidth获取【视觉视口】。
- 理想视口（idea viewport）：即屏幕的分辨率，iPhone5分辨率为320*568， 物理像素640*1136
- 当前缩放值 = idea / visual，缩放的本质是对visual的操作，并不会影响布局视口造成重绘

    > 如果设定如下：`<meta name="viewport" content="width=device-width, initial-scale=1.0">`，则可视视图为320

    > 如果设定如下：`<meta name="viewport" content="initial-scale=2.0">`，则可视视图为160，出现横向滚动条，字体被放大2倍

### 响应式设计稿


![](https://user-gold-cdn.xitu.io/2019/8/31/16ce7044474eb110?w=673&h=521&f=jpeg&s=62734)

### 媒体查询语法

```
@media all and (min-width:800px) and (orientation:landscape) {}
@media not (all and ())
// 逻辑操作符：and or not only（only主要兼容旧浏览器！最好带上！！！）
// width/height 视口宽高
// device-width 屏幕宽高
// orientation 横向竖向
// aspect-ratio 视口宽高比
// device-aspect-ratio 平补的宽高比
// color 每种颜色？
// resolution 打印机分辨率
// 视口：布局视口（页面原有大小）/可视视口（手机上的可视视口,即屏幕宽度）/理想视口（使用可视视口布局？），在手机端可以缩放网页/滑动位置；
// <meta name="viewport" content="device-width" />开启手机理想视口。手机的布局视口依赖网页设定？还是手机自己设定？
```

### 响应式图片(如何根据设备大小加载不同的图片？)

- Js
- srcset
- picture
- svg图片，矢量图形，随意缩放

### 响应式字体

字体的响应式，字体大小随着变化。
em和rem不够灵活，推荐使用font-size：5vw

### 实战总结

![](https://user-gold-cdn.xitu.io/2019/8/31/16ce70587a1d0f48?w=384&h=143&f=png&s=13019)
pc+移动，移动端小部件使用rem（适配手机），主要布局使用百分比？
-图片使用max-width，避免超出

## 可维护的CSS

### 可维护的要求

- DRY原则，Don't repeat yourself
- **尽量减少改动时要编辑的地方！**
- 当某些值依赖时，尽量把相互关系表达出来，如line-height和font-size（使用inherit继承属性）

### 预处理框架

- sass
- less
- stylus

### 后处理框架postcss

> PostCSS 这个术语可以指代两件事：一是 PostCSS 核心工具，二是基于 PostCSS 创建的插件系统。PostCSS 核心工具并不能直接用于处理样式，只有配合它的插件，才能完成相关的编译工作。

- 插件Autoprefixer，自动补充浏览器私有前缀
- 借助其他插件，postcss可以拥有变量/混合/嵌套等等能力

### 文件命名规范

- 公共型样式：标签重置、通用布局、通用模块元件、功能样式、皮肤样式
- 特殊型样式：页面与网站整体差异较大的样式
- 皮肤样式：将颜色和背景抽离，非换肤类网页慎用

```
<link href="assets/css/global.css" rel="stylesheet" type="text/css"/>
<link href="assets/css/index.css" rel="stylesheet" type="text/css"/>
<link href="assets/css/skin.css" rel="stylesheet" type="text/css"/>
```

### 类命名规范

- 重置（reset）和默认（base）：消除默认样式和浏览器差异，并设置部分标签的初始样式，以减少后面的重复劳动
```
    1. Eric Meyer’s “Reset CSS” 2.0
    2. Normalize.css
```
- 布局（grid）：将页面分割为几个大块，通常有头部、主体、主栏、侧栏、尾部等
- 模块（module）：通常是一个语义化的可以重复使用的较大的整体！比如导航、登录、注册、各种列表、评论、搜索等
- 元件（unit）：通常是一个不可再分的较为小巧的个体，通常被重复用于各种模块中！比如按钮、输入框、loading、图标等
- 功能（function）：为方便一些常用样式的使用，我们将这些使用率较高的样式剥离出来，按需使用，比如清除浮动等
- 皮肤（skin）：如果你需要把皮肤型的样式抽离出来，通常为文字色、背景色（图）、边框色等

补充说明：

- 不要用布局去控制模块或元件，模块和元件应与布局分离独立；
- 不要通过模块或其他类来重定义或修改已经定义好的功能类选择器和皮肤类选择器
- 当模块或元件互相嵌套，应该慎用标签选择器，避免样式冲突

### 样式编写规范

- 根据属性的重要性按顺序书写，先写定位布局属性，后写盒模型等自身属性，最后是文本类及修饰类属性

    - 显示属性： display、visibility、position、float、clear、top
    - 自身属性：width、height、margin、padding、border、overflow、min-width
    - 文本属性和修饰属性：font、text-align、text-decoration、vertical-align、white-space、color、background

- 如果属性间存在关联性，则不要隔开写，如:
```
    height: 18px;
    line-height: 18px;
```
- 先私有后标准，便于样式降级~

### BEM介绍

BEM的命名规则： ** 块名__元素--修饰符（状态等） **
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce705bea6de8cf?w=384&h=143&f=png&s=13019)

bem的抽象理解

![](https://user-gold-cdn.xitu.io/2019/8/31/16ce705ef97a5eef?w=500&h=301&f=png&s=96776)
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce705fd02216bc?w=500&h=256&f=png&s=126108)


BEM的优势
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce7064d1656fa7?w=480&h=346&f=png&s=78466)

- 使用唯一类名，避免造成样式冲突（如定义全局h2样式属性）
- 避免了位置依赖（不需要如下形式：`.sidebar conent-title__reversed`）
- 避免了深层嵌套bug，如使用h2选择器，深层h2标签将深受其害~~~

模块化原则：

- 单一原则：创建的类名必须有单一的、高度聚焦的理由。你应用到某个选择器里的样式应该是为了单一目的而创建的，并且能够很好地实现这个目标
- 单一样式来源：如果组件受父类名限制，则应该将限制写在该父组件的样式文件中
- 分离容器和内容：要求页面元素不依赖于其所处位置，在任何地方使用具有一致性
- 分离结构和主题，将视觉样式效果单独提取出来，拆分主题便于复用~
- 区分布局与组件角色和职责
![](https://user-gold-cdn.xitu.io/2019/8/31/16ce706da07429fc?w=339&h=174&f=png&s=9460)

定义css规则

- 布局只关注垂直对齐、水平对齐和文字间距
- 主题属性永远不要强制改变外观，它们必须保持布局、组件和元素可以应用于其上
- 永远不要在元素上使用上外边距，第一个元素总是贴着它所在组件的顶部
- **数据属性声明布局样式，数据属性绑定js？？？？？？**

bem是一个优秀的模块化方案，但是可能存在一些问题：
bem不是绝对，技术服务产品[https://adactio.com/journal/7276](https://adactio.com/journal/7276)

- 大量重复css代码，如偏移：`list-marginTop30 form-marginTop30`。
- 业务紧迫导致技术债，导致css的修改偏离了bem方案，经常重写或者复制粘贴。

### 向函数式css演进

  企业后台或使用了UI组件库（iview、element-ui），非常适合使用函数式css方案，函数式css能够有效的减少css代码重复量。

基于tachyons修改，打造自己的函数式css库（后台系统：样式要求低，页面多）
```
/*
针对宽度，定制常用的css类名
.w-120 width: 120px
.w20 width: 20%
.w--auto width: auto
*/

.w-80{width: 80px;}
.w20{ width: 20%; }
.w--auto{ width: auto; }
.w--third { width: 33.333333%; }
```


## css技巧

### css创建各种形状
http://tantek.com/CSS/Examples/polygons.html

### table-layout布局

> table-layout属性定义了用于布局表格单元格、行和列的算法。

- auto，表格和单元格的宽度取决于其包含的内容，大多数浏览器默认值
- fixed，表格和列的宽度通过具体width设定，可以使用overflow属性控制是否允许内容溢出

```
table{
    table-layout: fixed;
}
```

tableLayot-fixed：[指定宽度,超出显示省略号](https://codepen.io/xiaer/pen/ZZoLwb)

### css伪随机

> 蝉原则，使用质数作为循环周期来增加“自然随机性”的策略（模拟自然的随机效果）。如质数5、7的最小公倍数为35。

```
// 随机背景条纹
.stripes {
  background-color: #026873;
  background-image: linear-gradient(90deg, rgba(255,255,255,.07) 50%, transparent 50%),
    linear-gradient(90deg, rgba(255,255,255,.13) 50%, transparent 50%),
    linear-gradient(90deg, transparent 50%, rgba(255,255,255,.17) 50%),
    linear-gradient(90deg, transparent 50%, rgba(255,255,255,.19) 50%);
  background-size: 13px, 29px, 37px, 53px;
}
// 随机圆角效果，最小公倍数-质数相乘2310
.list:nth-child(2n + 1) {}
.list:nth-child(3n + 2) {}
.list:nth-child(5n + 3) {}
.list:nth-child(7n + 4) {}
.list:nth-child(11n + 5) {}
// 随机动画效果
animation: 1s spin, .7s radius, 1.1s color, 1.3s width;
```

随机背景条纹效果图：

![](https://user-gold-cdn.xitu.io/2019/8/31/16ce7075aee0ac1e?w=372&h=340&f=png&s=20722)

蝉原则案例：[随机颜色方块](https://codepen.io/xiaer/pen/yrjJxL)

### padding百分比的应用

padding百分比技术！！！
- 特别在视频播放领域，如何保证视频等比例缩放。https://alistapart.com/article/creating-intrinsic-ratios-for-video

### 图片对比

图片格式，jpeg高质量图片，有损压缩；png无损压缩支持透明通道，gif支持动画（透明通道可能带锯齿），svg矢量图，webp结合jpg高压缩和png透明而诞生的新标准。

## 引用：

1. 图书：《css master》《前端架构师》《高性能JavaScript》
2. 张鑫旭Blog：https://www.zhangxinxu.com/wordpress/
3. 网易NEC规范
4. 高质量css指南： https://cssguidelin.es/#dry
5. 

## 推荐

1. 《css秘密花园》，笔者也未看完这本书，但是里面的借助css实现的效果非常棒，值得阅读。