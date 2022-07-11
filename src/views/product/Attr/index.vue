<template>
  <div>
    <el-card style="margin: 20px 0px">
      <CategorySelect :show="!isShowTable"/>
    </el-card>
    <el-card>
      <div v-show="isShowTable">
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="addAttr">添加属性
        </el-button>
        <el-table style="width: 100%;margin-top: 20px" border :data="attrList">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150"></el-table-column>
          <el-table-column prop="address" label="属性值列表">
            <template slot-scope="{row,$index}">
              <el-tag style="margin-left: 10px" type="success" v-for="(attrValue) in row.attrValueList"
                      :key="attrValue.id">{{attrValue.valueName}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="操作" width="150" align="center">
            <template slot-scope="{row,$index}">
              <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateAttr(row)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowTable">
        <el-form :inline="true" ref="form" label-width="60px" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input placeholder="请输入属性名" v-model="attrInfo.attrName" @keyup.enter.native="addAttrValue"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-plus" @click="addAttrValue" :disabled="!attrInfo.attrName">添加属性值</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
        <el-table style="width: 100%;margin-top: 20px" border :data="attrInfo.attrValueList">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="name" label="属性值名称">
            <template slot-scope="{row,$index}">
              <el-input v-model="row.valueName" size="mini" placeholder="请输入属性值名称"
                        v-if="row.flag" @blur="toLook(row)" @keyup.enter.native="toLook(row)"
                        :ref="$index"></el-input>
              <span v-else @click="toEdit(row,$index)" style="display: block">{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="操作">
            <template slot-scope="{row,$index}">
              <!-- 气泡确认框 -->
              <el-popconfirm :title="`您确定删除【${row.valueName}】吗?`" @onConfirm="deleteAttrValue($index)">
                <el-button type="danger" icon="el-icon-delete" slot="reference" size="mini"></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" style="margin-top: 20px" @click="addOrUpdateAttr" :disabled="attrInfo.attrValueList < 1">保存</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
  import cloneDeep from 'lodash/cloneDeep'
  export default {
    name: 'Attr',
    data() {
      return {
        category1Id: '',
        category2Id: '',
        category3Id: '',
        attrList: [], //接收平台属性的数据
        isShowTable: true, //控制table表格显示与隐藏
        //收集新增属性|修改属性使用的
        attrInfo: {
          attrName: '',//属性名
          attrValueList: [],
          categoryId: 0, //三级分类id
          categoryLevel: 3 //服务器区分3级分类
        }
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
          this.getAttrList()
        }
      })
    },
    methods: {
      //获取平台属性的数据
      //当用户确定三级分类数据的时候，向服务器获取数据进行平台展示
      async getAttrList() {
        const {category1Id, category2Id, category3Id} = this
        let res = await this.$API.attr.reqAttrList(category1Id, category2Id, category3Id)
        if (res.code === 200) {
          this.attrList = res.data
        }
      },
      addAttrValue() {
        this.attrInfo.attrValueList.push({
          attrId: this.attrInfo.id,
          valueName: '',
          flag:true, //给每一个属性值天啊及一个标记flag，用户切换查看模式与编辑模式，好处：每一个属性值控制自己的模式切换
          //当前flag属性，响应式数据（数据变化视图跟着变化）
        })
        //点击添加属性的时候，自动获取焦点
        this.$nextTick(() => {
          this.$refs[this.attrInfo.attrValueList.length - 1].focus()
        })
      },
      //添加属性
      addAttr(){
        //显示表格
        this.isShowTable = false
        //清除数据
        this.attrInfo = {
          attrName: '',//属性名
          attrValueList: [],
          categoryId: this.category3Id, //三级分类id
          categoryLevel: 3 //服务器区分3级分类
        }

      },
      //修改属性
      updateAttr(row){
        this.isShowTable = false
        //由于数组结构当中存在对象里面套数组，数组里面有套对象，因此需要使用深拷贝解决这类问题
        //this.attrInfo = {...row}  浅拷贝
        this.attrInfo = cloneDeep(row)   //深拷贝
        this.attrInfo.attrValueList.forEach(item => {
          //这样书写也可以给属性值添加flag自动，但是会发现视图不会跟着变化（因为flag不是响应式数据）
          //因为Vue无法探测普通的新增 property，这样书写的属性并非是响应式的（数据变化视图跟着变）
          //item.flag = false

          //第一个参数：对象 第二个参数：添加新的响应式属性 第三个参数:新的属性的属性值
          this.$set(item,'flag',false)
        })
      },
      //失去焦点做的事 让input变为span
      toLook(row){
        if(row.valueName.trim() === ''){
          this.$message('请您输入一个正常的属性值')
          return
        }
        //新增的属性不能与已有的属性值重复
        let isRepat = this.attrInfo.attrValueList.some(item => {
          //需要将row从数组里面判断的时候去重
          //row最新的属性值【数组的最后一项元素】
          //判断的时候，需要把已有的数组当中新增的元素去除
          if(row !== item){
            return row.valueName === item.valueName
          }
        })
        if(isRepat)return //当有重复元素的时候，不能添加
        row.flag = false
      },
      //让span变为input
      toEdit(row,index){
        row.flag = true
        //获取input节点，实现自动聚焦
        //点击span的时候，重绘一个input它是需要耗费时间的，因此我们不可能一点击span立马获取到input
        //$nextTick,当节点渲染完毕了，会执行一次
        this.$nextTick(() => {
          //获取对应的input表单元素实现聚焦，因为index是一个变量，所以不能.了,只能 $refs[index]
          this.$refs[index].focus()
        })
      },
      //删除操作
      deleteAttrValue(index){
        this.attrInfo.attrValueList.splice(index,1)
      },
      //保存或更新操作
      async addOrUpdateAttr(){
        this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(item => {
          if(item.valueName !== ''){
            //删除掉flag属性
            delete item.flag
            return true
          }
        })
        try {
          await this.$API.attr.reqAddOrUpdateAttr(this.attrInfo)
          this.$message({type:'success',message:'保存成功'})
          this.isShowTable = true
          this.getAttrList()
        }catch (e) {
          this.$message('保存失败')
        }
      }
    },
  }
</script>

<style scoped>

</style>
