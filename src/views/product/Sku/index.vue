<template>
  <div>
    <el-table style="width: 100%;margin-top: 20px" border :data="records" v-loading="loading">
      <el-table-column type="index" label="序号" align="center" width="80"></el-table-column>
      <el-table-column prop="skuName" label="名称" align="center"></el-table-column>
      <el-table-column prop="skuDesc" label="描述" align="center"></el-table-column>
      <el-table-column label="默认图片" align="center" width="130px">
        <template slot-scope="{row,$index}">
          <img :src="row.skuDefaultImg" style="width: 100px;height: 100px">
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="重量(KG)" align="center" width="130px"></el-table-column>
      <el-table-column prop="price" label="价格(元)" align="center" width="130px"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row,$index}">
          <el-button type="success" icon="el-icon-top" size="mini" v-if="row.isSale === 1" title="下架" @click="cancel(row)"></el-button>
          <el-button v-else type="info" icon="el-icon-bottom" size="mini" title="上架" @click="sale(row)"></el-button>
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="$message('正在开发中...')"></el-button>
          <el-button type="info" icon="el-icon-info" size="mini" title="查看详情" @click="getSkuInfo(row)"></el-button>
          <template>
            <el-popconfirm title="这是一段内容确定删除吗？">
              <el-button type="danger" style="margin-left: 10px" slot="reference" icon="el-icon-delete" size="mini"
                         title="删除Sku"></el-button>
            </el-popconfirm>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
            style="margin-top: 20px;text-align: center"
            :current-page="page"
            :page-sizes="[3, 6, 10]"
            :page-size="limit"
            :page-count="7"
            @current-change="getPageList"
            layout="prev, pager, next, jumper, -> ,sizes,total"
            :total="total"
            @size-change="handleSizeChange">
    </el-pagination>
    <!-- 抽屉 -->
    <el-drawer :visible.sync="drawer" :with-header="false" size="50%">
      <el-row  style="margin-top: 20px">
        <el-col :span="5">名称:</el-col>
        <el-col :span="16">{{skuInfo.skuName}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">描述:</el-col>
        <el-col :span="16">{{skuInfo.skuDesc}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">价格:</el-col>
        <el-col :span="16">{{skuInfo.price}} 元</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">平台属性:</el-col>
        <el-col :span="16" style="margin-left: -3px">
          <el-tag type="success" v-for="(attr) in skuInfo.skuAttrValueList" :key="attr.id"
                  style="margin-left: 10px">{{attr.attrName}}--{{attr.valueName}}</el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">商品图片:</el-col>
        <el-col :span="16">
          <el-carousel height="400px" style="border: 1px solid #dedede;width: 400px">
            <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id">
              <img :src="item.imgUrl" style="height: 400px">
              </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
  export default {
    name: 'Sku',
    data(){
      return {
        page:1,
        limit:6,
        total:0,
        records:[],
        loading:false,
        skuInfo:{}, //存储sku的信息
        drawer:false //抽屉默认关闭的
      }
    },
    mounted() {
      this.getPageList()
    },
    methods: {
      //获取sku列表数据的方法
      async getPageList(pager = 1){
        this.loading = true,
        this.records = []
        this.page = pager
        const {page,limit} = this
        let result = await this.$API.sku.reqSkuList(page,limit)
        if(result.code === 200){
          this.records = result.data.records
          this.total = result.data.total
          this.loading = false
        }
      },
      handleSizeChange(limit){
        this.limit = limit
        this.getPageList()
      },
      //上架操作
      async sale(row){
        let res = await this.$API.sku.reqSale(row.id)
        if(res.code === 200){
          row.isSale = 1
          this.$message({type:'success',message:'上架成功!'})
        }
      },
      //下架操作
      async cancel(row){
        let res = await this.$API.sku.reqCancel(row.id)
        if(res.code === 200){
          row.isSale = 0
          this.$message({type:'success',message:'下架成功!'})
        }
      },
      //获取Sku详情的接口
      async getSkuInfo(sku){
        let res = await this.$API.sku.reqSkuById(sku.id)
        if(res.code === 200){
          this.drawer = true
          this.skuInfo = res.data
        }
      }
    }
  }
</script>

<style>
  .el-row .el-col-5 {
    font-size: 18px;
    text-align: right;
  }

  .el-col {
    margin: 10px 10px;
  }

  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }

  .el-carousel__button{
    width: 10px;
    height: 10px;
    background-color: red;
    border-radius: 50%;
  }
</style>
