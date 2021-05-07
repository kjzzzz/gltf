document.getElementById('fileInput').addEventListener('change', function selectedFileChanged() {
    if (this.files.length === 0) {
        console.log('请选择文件！');
        return;
    }

    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
        // 当读取完成时，内容只在`reader.result`中
        GLTFImporter(reader.result)
    };
    reader.readAsText(this.files[0]);
});

const nodeProp = {
  "mesh": MeshLoader,
};

const componentType = {
    5020 : 1,// BYTE
    5121 : 1,// UNSIGNED_BYTE
    5122 : 2,// SHORT
    5123 : 2,// UNSIGNED_SHORT
    5125 : 4,// UNSIGNED_INT
    5126 : 4,// FLOAT

};

const dataType = {
    "SCALAR" : 1,
    "VEC2" : 2,
    "VEC3" : 3,
    "VEC4" : 4,
    "MAT2" : 4,
    "MAT3" : 9,
    "MAT4" : 16,
};

const targetType = {
    34962 : "ARRAY_BUFFER",
    34963 : "ELEMENT_ARRAY_BUFFER"
};

const BASE64_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function GLTFImporter(content){
    console.log("import start");
    try{
        content = JSON.parse(content);
    }
    catch (e) {
        document.getElementById("fileLoadInfo").innerText = e
    }
    console.log(content);
    window.content = content;
    window.buffers = new Array(content.buffers.length);
    //decode base64 string
    for(let i=0;i<buffers.length;++i){
        const len = Math.ceil(content.buffers[i].byteLength*8/6/6) * 6;
        if(len % 4 !== 0)throw ("buffer length error");
        const uri = content.buffers[i].uri;
        buffers[i] = Array();
        let asd = "";
        for(let start = uri.length-len;start < uri.length;start++){
            asd += uri[start];
        }
        for(let start = uri.length-len;start < uri.length;start+=4){
            data1 = BASE64_STR.indexOf(uri[start]);
            data2 = BASE64_STR.indexOf(uri[start+1]);
            data3 = BASE64_STR.indexOf(uri[start+2]);
            data4 = BASE64_STR.indexOf(uri[start+3]);
            buffers[i].push((data1 << 2) | (data2 >> 4));
            buffers[i].push(((data2 & 15) << 4) | (data3 >> 2));
            buffers[i].push(((data3 & 3) << 6) | data4);
        }
        console.log(buffers[i]);
    }
    SceneLoader()
}

function SceneLoader(){
    for(let i=0;i<content.scenes.length;++i){
        console.log("load secne..."+i);
        for(let nodeIndex in content.scenes[i].nodes){
            // console.log(nodeIndex);
            const data = NodeLoader(nodeIndex)
        }
    }
}

function NodeLoader(index){
    console.log("load node..."+index);
    const node = content.nodes[index];
    for(let i in nodeProp){
        if(node[i] === undefined)throw "no property" + nodeProp[i];
        // console.log(i,node[i]);
        nodeProp[i](node[i])
    }
}

function MeshLoader(index){
    console.log("load mesh..."+index);
    const mesh = content.meshes[index];
    const primitives = IsPropExist_Required(mesh,"primitives");
    for(let primitive of primitives){
        IsPropExist_Required(primitive,"attributes");
        IsPropExist_Optional(primitive.attributes,"POSITION");
        ResolvePosition(content,primitive.attributes.POSITION)

    }

}

function ResolvePosition(content,index){
    console.log("resolve position...(accessor)"+index);
    const accessor = content.accessors[index];
    const bufferView = IsPropExist_Optional(accessor,"bufferView");
    let data = {};
    data.offset = IsPropExist_Optional(accessor,"byteOffset",0);
    data.componentType = componentType[IsPropExist_Required(accessor,"componentType")];
    data.count = IsPropExist_Required(accessor,"count");
    data.type = dataType[IsPropExist_Required(accessor,"type")];
    const buffer = GetBuffer(bufferView,data);
    //IsPropExist(accessor,"max");
    //IsPropExist(accessor,"min");
}

function GetBuffer(index, data) {
    console.log("bufferview"+index);
    const bv = content.bufferViews[index];
    const buffer = buffers[IsPropExist_Required(bv,"buffer")];
    const offset = IsPropExist_Optional(bv,"byteOffset",0);
    const len = IsPropExist_Required(bv,"byteLength");
    const sride = IsPropExist_Optional(bv,"byteStride");
    const target = targetType[IsPropExist_Optional(bv,"target")];
    console.log(data.componentType,data.count,data.type,len);
    if(len !== data.type*data.componentType*data.count)throw ("data length not match");
    let i = offset;
    let result = Array();
    while(i<offset+len){
        let res = Array();
        for(let k=0;k<data.type;++k)
            for(let j=0;j<data.componentType;++j){

            }
    }
    for(let i = offset;i < offset+len;i+=data.componentType){
        console.log(buffer[i])
    }
}

function IsPropExist_Required(content,prop){
    if(content[prop] === null){
        throw "no property" + prop;
    }
    return content[prop];
}

function IsPropExist_Optional(content,prop,defaultValue){
    if(content[prop] === null){
        return defaultValue || null;
    }
    return content[prop];
}