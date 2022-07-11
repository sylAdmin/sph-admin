<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" style="margin-top: 10px" @click="showDialog">
      添加
    </el-button>
    <!--
      表格组件
      data:表格组件将来要展示的数据-------数组类型
      border:是给表格添加边框
      column属性
      label:显示标题
      width：对应列的宽度
      align：标题对应的方式
     -->
    <el-table border :data="list" style="margin-top: 15px;" v-loading="loading">
      <el-table-column type="index" label="序号" width="80px" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="width">
        <template slot-scope="{row,$index}">
          <img v-lazy="row.logoUrl" style="width: 100px;height: 100px">
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{row,$index}">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateTradeMark(row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteTradeMark(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
            style="margin-top: 20px;text-align: center"
            :current-page="page"
            :page-sizes="[3, 5, 10]"
            :page-size="limit"
            :page-count="7"
            @current-change="getPageList"
            layout="prev, pager, next, jumper, -> ,sizes,total"
            :total="total"
            @size-change="handleSizeChange">
    </el-pagination>
    <!-- 对话框 -->
    <el-dialog :title="tmForm.id?'修改品牌':'添加品牌'" :visible.sync="dialogFormVisible" @keyup.enter="addOrUpdateTradeMark">
      <!-- :model属性，这个属性的作用是，把表单的数据收集到哪个对象上，将来表单验证，也需要这个属性
          Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可
       -->
      <el-form style="width: 80%" :model="tmForm" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
                  class="avatar-uploader"
                  action="/dev-api/admin/product/fileUpload"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess">
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" alt="tmForm.tmName">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'TradeMark',
    data() {
      return {
        page: 1,
        limit: 3,
        total: 0,
        list: [], //列表展示的数据
        dialogFormVisible: false, //对话框显示与隐藏的属性
        imageUrl: '',
        loading:false,
        //收集品牌信息
        tmForm: {
          tmName: '',
          logoUrl: '',
        },
        rules: {
          //品牌名称的验证规则
          tmName: [
            { required: true, message: '请输入品牌名称', trigger: 'blur' },
            { required:true, min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' }
          ],
          //品牌的logo验证规则
          logoUrl: [
            { required: true, message: '请选择品牌的图片'}
          ],
        }
      }
    },
    mounted() {
      this.getPageList()
    },
    methods: {
      //获取品牌列表
      async getPageList(pager = 1) {
        this.list = []
        this.loading = true
        this.page = pager
        const {page, limit} = this
        let result = await this.$API.trademark.reqTradeMarkList(page, limit)
        if (result.code === 200) {
          this.total = result.data.total
          this.list = result.data.records
          if (this.list[0].logoUrl === '/static/default.jpg') {
            this.list[0].logoUrl = 'https://img2.baidu.com/it/u=3600306204,4254793728&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
            this.list[1].logoUrl = 'https://img2.baidu.com/it/u=4166992171,3600972265&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=576'
            this.list[2].logoUrl = 'https://img2.baidu.com/it/u=2437850439,2447755203&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500'
          }
          this.loading = false
        }
      },
      //获取每页展示数据
      handleSizeChange(limit) {
        this.limit = limit
        this.getPageList()
      },
      showDialog() {
        this.dialogFormVisible = !this.dialogFormVisible
        this.tmForm = {tmName: "", logoUrl: ''}
      },
      updateTradeMark(row) {
        this.dialogFormVisible = true
        this.tmForm = {...row}
      },
      handleAvatarSuccess(res, file) {
        //res: 上传成功之后返回前端数据
        //file：上传成功之后服务器返回前端数据
        this.tmForm.logoUrl = res.data
        this.imageUrl = URL.createObjectURL(file.raw);
      },
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      },
      addOrUpdateTradeMark() {
        //当全部表单验证字段通过后，再去写业务逻辑
        this.$refs.ruleForm.validate(async(success) => {
          if(success){
            this.dialogFormVisible = false
            let res = await this.$API.trademark.reqAddOrUpdateTradeMark(this.tmForm)
            if (res.code === 200) {
              this.$message({type: 'success', message: this.tmForm.id ? '修改品牌成功' : '添加品牌成功'})
              this.getPageList(this.page);
            }
          }else{
            console.log('error submit!')
            return false
          }
        })
      },
      deleteTradeMark(row){
        this.$confirm(`您确定删除${row.tmName}`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          let res = await this.$API.trademark.reqDeleteTradeMark(row.id)
          if(res.code === 200){
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getPageList(this.page)
          }
        });
      }
    },
  }
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
