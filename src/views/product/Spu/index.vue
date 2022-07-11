<template>
  <div>
    <el-card style="margin: 20px 0px">
      <CategorySelect :show="scene !== 0"/>
    </el-card>
    <el-card>
      <div v-show="scene === 0">
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="addSpu">添加SPU</el-button>
        <el-table border style="margin-top: 20px" :data="records">
          <el-table-column type="index" label="序号" width="80" align="center"/>
          <el-table-column prop="spuName" label="spu名称" width="230px"/>
          <el-table-column prop="description" label="spu描述"/>
          <el-table-column prop="address" label="操作" width="230px">
            <template slot-scope="{row,$index}">
              <el-button type="success" icon="el-icon-plus" size="mini" title="添加Sku" @click="addSku(row)"></el-button>
              <el-button type="warning" icon="el-icon-edit" size="mini" title="修改Spu"
                         @click="updateSpu(row)"></el-button>
              <el-button type="info" icon="el-icon-info" size="mini" @click="handler(row)" title="查看当前Spu全部Sku列表"></el-button>
              <template>
                <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="deleteSpu(row)">
                  <el-button type="danger" style="margin-left: 10px" slot="reference" icon="el-icon-delete" size="mini"
                             title="删除Spu"></el-button>
                </el-popconfirm>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <!--
         -->
        <el-pagination
                style="margin-top: 20px;text-align: center"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="page"
                :page-sizes="[3, 5, 10]"
                :page-size="limit"
                layout="prev, pager, next, jumper,->,sizes,total"
                :total="total">
        </el-pagination>
      </div>
      <SpuForm v-show="scene === 1" ref="spu"/>
      <SkuForm v-show="scene === 2" ref="sku"/>
    </el-card>
    <el-dialog :title="`${spu.spuName} 的Sku的列表`" :visible.sync="dialogTableVisible" @close="closeDialog">
      <el-table :data="skuList" border v-loading="loading">
        <el-table-column property="skuName" label="名称"></el-table-column>
        <el-table-column property="price" label="价格"></el-table-column>
        <el-table-column property="weight" label="重量"></el-table-column>
        <el-table-column label="默认图片">
          <template slot-scope="{row,$index}">
            <img :src="row.skuDefaultImg" style="width: 100px;height: 100px">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
  import SkuForm from './SkuForm'
  import SpuForm from './SpuForm'

  export default {
    name: 'Spu',
    components: {
      SkuForm,
      SpuForm,
    },
    data() {
      return {
        page: 1,
        limit: 3,
        category1Id: '',
        category2Id: '',
        category3Id: '',
        records: [], //spu列表数据
        total: 0,
        scene: 0,//0代表展示SPU列表数据  1 添加SPU|修改SPU  2 添加SKU
        dialogTableVisible:false, //控制dialog的显示与隐藏
        spu:{},
        skuList:[] ,//存储的是SKU列表的数据
        loading:true,
      }
    },
    mounted() {
      this.$bus.$on('getCategoryId', ({categoryId, level}) => {
        if (level === 1) {
          this.category1Id = categoryId
          this.category2Id = ''
          this.category3Id = ''
          this.attrList = []
        } else if (level === 2) {
          this.category2Id = categoryId
          this.category3Id = ''
        } else {
          this.category3Id = categoryId
          this.getSpuList()
        }
      })
      this.$bus.$on('scene', ({scene, flag}) => {
        this.scene = scene
        if (flag === '添加') {
          this.getSpuList()
        } else {
          this.getSpuList(this.page)
        }
      })
    },
    methods: {
      //获取Spu列表数据
      async getSpuList(pager = 1) {
        this.page = pager
        const {page, limit, category3Id} = this
        let result = await this.$API.spu.reqSpuList(page, limit, category3Id)
        if (result.code === 200) {
          this.records = result.data.records
          this.total = result.data.total
        }
      },
      handleCurrentChange(page) {
        this.getSpuList(page)
      },
      handleSizeChange(limit) {
        this.limit = limit
        this.getSpuList()
      },
      //添加Spu
      addSpu() {
        this.scene = 1
        this.$bus.$emit('addSpu', this.category3Id)
      },
      //修改Spu
      updateSpu(row) {
        //在父组件当中可以通过$ref获取子组件
        this.$refs.spu.initSpuData(row)
        this.scene = 1
      },
      async deleteSpu(row) {
        let res = await this.$API.spu.reqDeleteSpu(row.id)
        if (res.code === 200) {
          this.$message({type: "success", message: '删除成功'})
          this.getSpuList(this.records.length > 1 ? this.page : this.page - 1)
        }
      },
      //添加Sku
      addSku(row){
        this.scene = 2
        //父组件通知子组件，让子组件发请求-------三个请求
        this.$refs.sku.getData(this.category1Id,this.category2Id,row)
      },
      //显示Sku列表数据
      async handler(spu){
        this.dialogTableVisible = true
        this.loading = true
        this.spu = spu
        let result = await this.$API.spu.reqSkuList(spu.id)
        if(result.code === 200){
          this.skuList = result.data
          this.loading = false
        }
      },
      closeDialog(){
        this.skuList = []
      }
    }
  }
</script>

<style scoped>

</style>
