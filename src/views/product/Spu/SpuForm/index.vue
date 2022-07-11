<template>
  <div>
    <el-form ref="form" label-width="80px" :model="spu">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spu.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spu.tmId">
          <el-option :label="tm.tmName" :value="tm.id" v-for="(tm,index) in tradeMarkList" :key="tm.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input type="textarea" rows="4" placeholder="SPU描述" v-model="spu.description"></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <!--
          on-preview:图片预览功能
          on-remove:删除图片的时候会触发
         -->
        <el-upload
                action="/dev-api/admin/product/fileUpload"
                list-type="picture-card"
                :file-list=spuImageList
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                :on-success="handlerSuccess">
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select :placeholder="unQuery" v-model="attrIdAndAttrName">
          <el-option :label="unselect.name" :value="`${unselect.id}:${unselect.name}`" v-for="(unselect,index) in unSelectSaleAttr" :key="unselect.id"></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus" style="margin-left: 20px"
                   :disabled="!attrIdAndAttrName" @click="addSaleAttr">添加销售属性</el-button>
        <el-table style="width: 100%;margin-top: 20px" border :data="spu.spuSaleAttrList">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="180"></el-table-column>
          <el-table-column prop="address" label="属性值名称列表">
            <template slot-scope="{row,$index}">
              <el-tag :key="tag.id" v-for="(tag,index) in row.spuSaleAttrValueList" closable :disable-transitions="false"
                      @close="row.spuSaleAttrValueList.splice(index,1)">
                {{tag.saleAttrValueName}}
              </el-tag>
              <el-input class="input-new-tag" v-if="row.inputVisible" v-model="row.inputValue"
                        ref="saveTagInput" size="small" @keyup.enter.native="$refs.saveTagInput.blur()"
                        @blur="handleInputConfirm(row)">
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">添加</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="操作" width="150px">
            <template slot-scope="{row,$index}">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="spu.spuSaleAttrList.splice($index,1)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'SpuForm',
    data() {
      return {
        dialogImageUrl: '',
        dialogVisible: false,
        spu: {
          category3Id: 0, //三级分类的id
          description: "", //描述
          spuName: "", //spu名称
          tmId: "", //平台的id
          //收集SPU图片的信息
          spuImageList: [
            // {
            //   id: 0,
            //   imgName: "string",
            //   imgUrl: "string",
            //   spuId: 0,
            // },
          ],
          //平台销售属性与属性值收集
          spuSaleAttrList: [
            // {
            //   baseSaleAttrId: 0,
            //   id: 0,
            //   saleAttrName: "string",
            //   spuId: 0,
            //   spuSaleAttrValueList: [
            //     {
            //       baseSaleAttrId: 0,
            //       id: 0,
            //       isChecked: "string",
            //       saleAttrName: "string",
            //       saleAttrValueName: "string",
            //       spuId: 0,
            //     },
            //   ],
            // },
          ],
        }, //存储SPU信息属性
        tradeMarkList: [], //存储品牌信息
        spuImageList: [], //存储SPU图片的数据
        saleAttrList: [] ,//存储销售属性列表
        inputVisible: false,
        attrIdAndAttrName:'', //收集未选择的销售属性的id
      }
    },
    computed:{
      //计算出还未选择的销售属性
      unSelectSaleAttr(){
        let result = this.saleAttrList.filter(item => {
          return this.spu.spuSaleAttrList.every(item1 => {
            return item.name !== item1.saleAttrName
          })
        })
        return result
      },
      unQuery(){
        return this.unSelectSaleAttr.length > 0 ? "还有"+this.unSelectSaleAttr.length+"未选择" : "没有啦。。。"
      }
    },
    methods: {
      //添加新的销售属性
      addSaleAttr(){
        const [baseSaleAttrId,saleAttrName] = this.attrIdAndAttrName.split(":")
        let newSaleAttr = {baseSaleAttrId,saleAttrName,spuSaleAttrValueList: []}
        this.spu.spuSaleAttrList.push(newSaleAttr)
        //清空数据
        this.attrIdAndAttrName = ""
      },
      //上传图片成功时的回调
      handlerSuccess(response,file,fileList){
        //收集图片信息
        this.spuImageList = fileList
      },
      //删除图片的时候会触发
      //file:代表删除的那张图片
      //fileList:照片墙删除某一张图片后剩余的其他图片
      handleRemove(file, fileList) {
        this.spuImageList = fileList
      },
      //预览大图的时候会触发
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      async initSpuData(spu) {
        this.spuImageList = ''
        //获取SPU信息的数据
        let spuResult = await this.$API.spu.reqSpu(spu.id)
        if (spuResult.code === 200) {
          this.spu = spuResult.data
        }
        //获取品牌的信息
        this.getTradeMarkList()
        //获取spu图片地址
        let spuImageResult = await this.$API.spu.reqSpuImageList(spu.id)
        if (spuImageResult.code === 200) {
          let listArr = spuImageResult.data
          listArr.forEach(item => {
            item.name = item.imgName
            item.url = item.imgUrl
          })
          this.spuImageList = listArr
        }
        //获取平台全部的销售属性
        this.getBaseSaleAttrList()
      },
      //获取品牌信息
      async getTradeMarkList(){
        let tradeMarkResult = await this.$API.spu.reqTradeMarkList()
        if (tradeMarkResult.code === 200) {
          this.tradeMarkList = tradeMarkResult.data
        }
      },
      //获取销售属性
      async getBaseSaleAttrList(){
        let saleResult = await this.$API.spu.reqBaseSaleAttrList()
        if (saleResult.code === 200) {
          this.saleAttrList = saleResult.data
        }
      },
      //显示input
      showInput(row) {
        this.$set(row,'inputVisible',true)
        this.$set(row,'inputValue',"")
        this.$nextTick(() => {
          this.$refs.saveTagInput.focus()
        })
      },
      //失去焦点时，新增销售属性值
      handleInputConfirm(row) {
        //结构销售属性当中收集数据
        const {baseSaleAttrId,inputValue} = row
        if(inputValue.trim() === ''){
          row.inputVisible = false
          return
        }
        let result = row.spuSaleAttrValueList.some(item => item.saleAttrValueName === inputValue)
        if(result){
          this.$message("不能添加重复数据")
          return;
        }
        let newSaleAttrValue = {baseSaleAttrId,saleAttrValueName:inputValue}
        row.spuSaleAttrValueList.push(newSaleAttrValue)
        row.inputVisible = false
      },
      //保存按钮的回调
      async addOrUpdateSpu(){
        this.spu.spuImageList =  this.spuImageList.map(item => {
          return {
            imgName: item.name,
            imgUrl: (item.response && item.response.data) || item.url,
            spuId: this.spu.id || '',
          }
        })
        let result = await this.$API.spu.reqAddOrUpdateSpu(this.spu)
        if(result.code === 200){
          this.$message({type:'success',message:'保存成功'})
          this.$bus.$emit('scene',{scene:0,flag:this.spu.id?'修改':'添加'})
          //清理数据
          Object.assign(this._data,this.$options.data())
        }
      },
      //取消按钮的回调
      cancel(){
        this.$bus.$emit('scene',{scene:0,flag:''})
        //清理数据
        Object.assign(this._data,this.$options.data())
      }
    },
    mounted() {
      this.$bus.$on('addSpu',(id) => {
        this.spu = {
          category3Id: 0, //三级分类的id
          description: "", //描述
          spuName: "", //spu名称
          tmId: "", //平台的id
          //收集SPU图片的信息
          spuImageList: [],
          //平台销售属性与属性值收集
          spuSaleAttrList: [],
        }
        this.spuImageList = []
        this.getTradeMarkList()
        this.getBaseSaleAttrList()
        this.spu.category3Id = id
      })
    },
  }
</script>

<style>
  .el-tag + .el-tag {
    margin-left: 10px;
  }

  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
