<template>
  <div>
    <el-form ref="form" label-width="100px">
      <el-form-item label="SPU名称">{{spu.spuName}}</el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="SKU名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input placeholder="价格(元)" type="number" v-model="skuInfo.price"></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input placeholder="重量(千克)" v-model="skuInfo.weight"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input type="textarea" :rows="4" placeholder="规格描述" v-model="skuInfo.skuDesc"></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item :label="attr.attrName" v-for="(attr,index) in attrInfoList" :key="attr.id">
            <el-select placeholder="请选择" v-model="attr.attrIdAndValueId">
              <el-option :label="attrValue.valueName" :value="`${attr.id}:${attrValue.id}`"
                         v-for="(attrValue,index) in attr.attrValueList" :key="attrValue.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item :label="saleAttr.saleAttrName" v-for="(saleAttr,index) in spuSaleAttrList" :key="saleAttr.id">
            <el-select placeholder="请选择" v-model="saleAttr.saleIdAndValueId">
              <el-option :label="saleAttrValue.saleAttrValueName" :value="`${saleAttr.id}:${saleAttrValue.id}`"
                         v-for="(saleAttrValue,index) in saleAttr.spuSaleAttrValueList" :key="saleAttrValue.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
          <el-table style="width: 100%" border :data="spuImageList" @selection-change="handleSelectionChange">
            <!--@selection-change="handleSelectionChange"-->
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column label="图片">
              <template slot-scope="{row,$index}">
                <img :src="row.imgUrl" style="width: 100px;height: 100px"/>
              </template>
            </el-table-column>
            <el-table-column label="名称" prop="imgName"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="{row,$index}">
                <el-button type="primary" v-if="row.isDefault === 0" @click="changeDefault(row)">设为默认</el-button>
                <el-button v-else>默认</el-button>
              </template>
            </el-table-column>
          </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'SkuForm',
    data() {
      return {
        spuImageList:[], //存储图片的信息
        spuSaleAttrList:[], //存储销售属性的数据
        attrInfoList:[], //存储平台属性的数据
        //收集sku数据的字段
        skuInfo: {
          //第一类收集的数据：父组件给的数据
          category3Id: 0,
          spuId: 0,
          tmId: 0,
          //第二类：需要通过数据双向绑定v-model收集
          skuName: "",
          price: 0,
          weight: "",
          skuDesc: "",
          //第三类：需要自己书写代码
          skuDefaultImg: "", ////默认图片
          //收集图片的字段
          skuImageList: [
            // {
            //   id: 0,
            //   imgName: "string",
            //   imgUrl: "string",
            //   isDefault: "string",
            //   skuId: 0,
            //   spuImgId: 0,
            // },
          ],
          //平台属性
          skuAttrValueList: [
            // {
            //   attrId: 0,
            //   valueId: 0,
            // },
          ],
          //销售属性
          skuSaleAttrValueList: [
            // {
            //   id: 0,
            //   saleAttrId: 0,
            //   saleAttrName: "string",
            //   saleAttrValueId: 0,
            //   saleAttrValueName: "string",
            //   skuId: 0,
            //   spuId: 0,
            // },
          ],
        },
        spu:{},
        imageList:[], //收集图片的数据字段
      }
    },
    methods: {
      //获取数据
      async getData(category1Id, category2Id, spu) {
        this.skuInfo.category3Id = spu.category3Id
        this.skuInfo.spuId = spu.id
        this.skuInfo.tmId = spu.tmId
        this.spu = spu
        let result = await this.$API.spu.reqSkuImageList(spu.id)
        if(result.code === 200){
          let list = result.data
          list.forEach(item => {
            item.isDefault = 0
          })
          this.spuImageList = list
        }
        let result1 = await this.$API.spu.reqSpuSaleAttrList(spu.id)
        if(result.code === 200){
          this.spuSaleAttrList = result1.data
        }
        let result2 = await this.$API.spu.reqAttrInfoList(category1Id,category2Id,spu.category3Id)
        if(result.code === 200){
          this.attrInfoList = result2.data
        }
      },
      //取消按钮的回调
      cancel() {
        this.$bus.$emit('scene', {scene: 0, flag: ''})
        //清理数据
        Object.assign(this._data, this.$options.data())
      },
      //表格复选框按钮事件
      handleSelectionChange(params){
        //params:获取到用户选中的信息数据
        this.imageList = params
      },
      //设置默认按钮的回调
      changeDefault(row){
        this.spuImageList.forEach(item => {
          item.isDefault = 0
        })
        row.isDefault = 1
        //收集默认图片
        this.skuInfo.skuDefaultImg = row.imgUrl
      },
      //保存按钮事件
      async save(){
        const {attrInfoList,skuInfo,spuSaleAttrList,imageList} = this
        //整理平台属性的数据
        skuInfo.skuAttrValueList = attrInfoList.reduce((prev,item)=>{
          if(item.attrIdAndValueId){
            const [attrId,valueId] = item.attrIdAndValueId.split(":")
            prev.push({attrId,valueId})
          }
          return prev
        },[]);
        //整理销售属性的数据
        skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((prev,item)=>{
          if(item.saleIdAndValueId){
            const [saleAttrId,saleAttrValueId] = item.saleIdAndValueId.split(":")
            prev.push({saleAttrId,saleAttrValueId})
          }
          return prev
        },[]);
        //整理图片的数据
        skuInfo.skuImageList = imageList.map(item => {
          return {
            imgName:item.imgName,
            imgUrl:item.imgUrl,
            isDefault:item.isDefault,
            spuImgId:item.id
          }
        })
        //发请求
        let result = await this.$API.spu.reqAddSku(skuInfo)
        if(result.code === 200){
          this.$message({type:'success',message:'添加SKU成功'})
          this.cancel()
        }
      }
    }
  }
</script>

<style scoped>

</style>
