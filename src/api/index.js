//将四个模块请求的接口函数统一暴露
import * as trademark from './product/TradeMark';
import * as attr from './product/Attr';
import * as spu from './product/Spu';
import * as sku from './product/Sku';

//引入权限相关的接口文件
import * as user from './acl/user';
import role from './acl/role';
import permission from './acl/permission'
//对外暴露
export default {
     trademark,
     attr,
     sku,
     spu,
     user,
     role,
     permission
}
