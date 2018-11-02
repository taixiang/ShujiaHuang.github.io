![image](http://upload-images.jianshu.io/upload_images/7569533-d9e8808e835dd2d3?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

公司产品需要一个雷达图来展示各维度的比重，网上找了一波，学到不少，直接自己上手来撸一记

无图言虚空

![image](http://upload-images.jianshu.io/upload_images/7569533-ae4fda3e2bb099b9?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

简单分析一波，确定雷达图正几边形的--正五边形 int count=5，分为几个层数--4 层 int layerCount=4
```
    @Override

    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        drawPolygon(canvas);//画边
        drawLines(canvas);//画线
        drawText(canvas);//描绘文字
        drawRegion(canvas);//覆盖区域
    }
```

主要这几步，开撸！

#### 自定义RadarView继承View

确定需要使用的变量，初始化paint，计算圆心角
```
private int count = 5; //几边形    
private int layerCount = 4; //层数    
privatefloatangle; //每条边对应的圆心角   
private int centerX; //圆心x    
private int centerY; //圆心y    
privatefloatradius; //半径    
private Paint polygonPaint; //边框paint    
private Paint linePaint; //连线paint    
private Paint txtPaint; //文字paint    
private Paint circlePaint; //圆点paint    
private Paint regionColorPaint; //覆盖区域paint    
private Double[] percents = {0.91, 0.35, 0.12, 0.8, 0.5}; //覆盖区域百分比    
private String[] titles = {"dota","斗地主","大吉大利，晚上吃鸡","炉石传说","跳一跳"};//文字
```
```
    public RadarView(Context context) {
        this(context, null, 0);
    }

    public RadarView(Context context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public RadarView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        //计算圆心角
        angle = (float) (Math.PI * 2 / count);

        polygonPaint = new Paint();
        polygonPaint.setColor(ContextCompat.getColor(context, R.color.radarPolygonColor));
        polygonPaint.setAntiAlias(true);
        polygonPaint.setStyle(Paint.Style.STROKE);
        polygonPaint.setStrokeWidth(4f);

        linePaint = new Paint();
        linePaint.setColor(ContextCompat.getColor(context, R.color.radarLineColor));
        linePaint.setAntiAlias(true);
        linePaint.setStyle(Paint.Style.STROKE);
        linePaint.setStrokeWidth(2f);

        txtPaint = new Paint();
        txtPaint.setColor(ContextCompat.getColor(context, R.color.radarTxtColor));
        txtPaint.setAntiAlias(true);
        txtPaint.setStyle(Paint.Style.STROKE);
        txtPaint.setTextSize(DensityUtil.dpToPx(context, 12));

        circlePaint = new Paint();
        circlePaint.setColor(ContextCompat.getColor(context, R.color.radarCircleColor));
        circlePaint.setAntiAlias(true);

        regionColorPaint = new Paint();
        regionColorPaint.setColor(ContextCompat.getColor(context, R.color.radarRegionColor));
        regionColorPaint.setStyle(Paint.Style.FILL);
        regionColorPaint.setAntiAlias(true);

    }
```
#### 确定中心点
需要正五边形得有一个圆，圆内接正五边形，在onSizeChanged方法里获取圆心，确定半径

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        radius = Math.min(h, w) / 2 * 0.7f;
        centerX = w / 2;
        centerY = h / 2;
    }

#### 绘制正五边形
绘制正五边形同时描绘最外围的点，确定分为4层，半径 / 层数 =每层之间的间距，从最里层开始画正五边形，每层第一个点位于中心点正上方
```
  private void drawPolygon(Canvas canvas) {
        Path path = new Path();
        float r = radius / layerCount;
        for (int i = 1; i <= layerCount; i++) {
            float curR = r * i; //当前所在层的半径
            for (int j = 0; j < count; j++) {
                if (j == 0) {
                    //每一层第一个点坐标
                    path.moveTo(centerX, centerY - curR);  
                } else {
                    //顺时针记录其余顶角的点坐标
                    float x = (float) (centerX + Math.sin(angle * j) * curR);
                    float y = (float) (centerY - Math.cos(angle * j) * curR);
                    path.lineTo(x, y);
                }
            }
            //最外层的顶角外面的五个小圆点(图中红色部分)
            if (i == layerCount) {
                for (int j = 0; j < count; j++) {
                    float x = (float) (centerX + Math.sin(angle * j) * (curR + 12));
                    float y = (float) (centerY - Math.cos(angle * j) * (curR + 12));
                    canvas.drawCircle(x, y, 4, circlePaint);
                }
            }
            path.close();
            canvas.drawPath(path, polygonPaint);
        }
    }
```
![image.png](https://upload-images.jianshu.io/upload_images/7569533-6e3bddc24956c503.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 绘制连线
绘制最内层顶角到最外层顶角的连线
```
  private void drawLines(Canvas canvas) {
        float r = radius / layerCount;
        for (int i = 0; i < count; i++) {
            //起始坐标 从中心开始的话 startx=centerX , startY=centerY
            float startX = (float) (centerX + Math.sin(angle * i) * r);
            float startY = (float) (centerY - Math.cos(angle * i) * r);
            //末端坐标
            float endX = (float) (centerX + Math.sin(angle * i) * radius);
            float endY = (float) (centerY - Math.cos(angle * i) * radius);
            canvas.drawLine(startX, startY, endX, endY, linePaint);
        }
    }
```
![image.png](https://upload-images.jianshu.io/upload_images/7569533-348c6fd33b4196ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
至此简易雷达图成型，可以修改正几边形，多少层数（后续继续添加文字）
```
    //设置几边形，**注意：设置几边形需要重新计算圆心角**
    public void setCount(int count){
        this.count = count;
        angle = (float) (Math.PI * 2 / count);
        invalidate();
    }

    //设置层数
    public void setLayerCount(int layerCount){
        this.layerCount = layerCount;
        invalidate();
    }
```

设置正六边形、六层

    radarView.setCount(6);
    radarView.setLayerCount(6);

![image.png](https://upload-images.jianshu.io/upload_images/7569533-ae6fc5b4b20cbce3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

对于以下图形的，可以设置第一个点坐标位于中心点正右侧`(centerX+curR,centerY)`，顺时针计算其余顶点坐标`x = (float) (centerX+curR*Math.cos(angle*j)), y = (float) (centerY+curR*Math.sin(angle*j))`，同理连线等其余坐标相应改变...
![image.png](https://upload-images.jianshu.io/upload_images/7569533-713bd6c3b19f45fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 描绘文字

由于各产品维度内容不同，所需雷达图样式不一，这里只是描绘下不同位置的文字处理情况，具体需求还得按产品来，因产品而异
```
    private void drawText(Canvas canvas) {
        for (int i = 0; i < count; i++) {
            //获取到雷达图最外边的坐标
            float x = (float) (centerX + Math.sin(angle * i) * (radius + 12));
            float y = (float) (centerY - Math.cos(angle * i) * (radius + 12));
            if (angle * i == 0) {
                //第一个文字位于顶角正上方
                txtPaint.setTextAlign(Paint.Align.CENTER);
                canvas.drawText(titles[i], x, y - 18, txtPaint);
                txtPaint.setTextAlign(Paint.Align.LEFT);
            } else if (angle * i > 0 && angle * i < Math.PI / 2) {
                //微调
                canvas.drawText(titles[i], x + 18, y + 10, txtPaint);
            } else if (angle * i >= Math.PI / 2 && angle * i < Math.PI) {
                //最右下的文字获取到文字的长、宽，按文字长度百分比向左移
                String txt = titles[i];
                Rect bounds = new Rect();
                txtPaint.getTextBounds(txt, 0, txt.length(), bounds);
                float height = bounds.bottom - bounds.top;
                float width = txtPaint.measureText(txt);
                canvas.drawText(txt, x - width * 0.4f, y + height + 18, txtPaint);
            } else if (angle * i >= Math.PI && angle * i < 3 * Math.PI / 2) {
                //同理最左下的文字获取到文字的长、宽，按文字长度百分比向左移
                String txt = titles[i];
                Rect bounds = new Rect();
                txtPaint.getTextBounds(txt, 0, txt.length(), bounds);
                float width = txtPaint.measureText(txt);
                float height = bounds.bottom - bounds.top;
                canvas.drawText(txt, x - width * 0.6f, y + height + 18, txtPaint);
            } else if (angle * i >= 3 * Math.PI / 2 && angle * i < 2 * Math.PI) {
                //文字向左移动
                String txt = titles[i];
                float width = txtPaint.measureText(txt);
                canvas.drawText(txt, x - width - 18, y + 10, txtPaint);
            }

        }
    }
```
![image.png](https://upload-images.jianshu.io/upload_images/7569533-20f675e1ea9db4a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 绘制覆盖区域

绘制覆盖区域，百分比取连线长度的百分比(如果从中心点开始的连线，则是半径的百分比)，此处用半径radius减去间隔r即连线长度
```
   private void drawRegion(Canvas canvas) {
        Path path = new Path();
        float r = radius / layerCount;//每层的间距
        for (int i = 0; i < count; i++) {
            if (i == 0) {
                path.moveTo(centerX, (float) (centerY - r - (radius - r) * percents[i]));
            } else {
                float x = (float) (centerX + Math.sin(angle * i) * (percents[i] * (radius - r) + r));
                float y = (float) (centerY - Math.cos(angle * i) * (percents[i] * (radius - r) + r));
                path.lineTo(x, y);
            }
        }
        path.close();
        canvas.drawPath(path, regionColorPaint);
    }
```
![image.png](https://upload-images.jianshu.io/upload_images/7569533-7b2f2aaf625bc79f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

至此，一个简单的雷达图完毕。同时欢迎关注微信公众号
![image.png](https://upload-images.jianshu.io/upload_images/7569533-cfeb1f55473a2143.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### End

