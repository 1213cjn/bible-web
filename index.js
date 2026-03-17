Page({
  data: {
    showAR: false,
    canvasWidth: 0,
    canvasHeight: 0,
    width: 0,
    height: 0,
    bgImageUrl: '',
    isGenerating: false,
    generatedModelUrl: '',
    CacheModelUrl: '',
    modelCachedPath: '',
    progressTip: '',
    // 新增：临时存储当前缩略图路径，用于自动保存时存入 modelList
    currentThumbPath: ''
  },
// 必須補齊這個函數，否則 AR 引擎會因為找不到回調而報錯停止
handleHitTest(e) {
  const { position } = e.detail;
  // 將寵物模型精確定位到點擊的地板位置
  const pet = this.scene.getNodeById('petModel');
  if (pet) {
    pet.item.position.set(position);
    console.log('模型已放置在地面：', position);
  }
},

onSceneReady(e) {
  this.scene = e.detail.value;
  console.log('原生 AR 場景已就緒');

},
  onLoad() {
    // 修正系统信息获取 API
    const info = wx.getSystemSetting();
    const dpr = info.pixelRatio;
    this.setData({
      canvasWidth: Math.ceil(info.windowWidth * dpr),
      canvasHeight: Math.ceil(info.windowHeight * dpr),
      width: info.windowWidth,
      height: info.windowHeight
    });
    this.getBackgroundImage();
    this.loadFirstModelFromCache();
  },

  getBackgroundImage() {
    const fileID = 'cloud://cloud1-1g97wouob440150e.636c-cloud1-1g97wouob440150e-1410792396/pet/bg (2).png';
    wx.cloud.getTempFileURL({
      fileList: [fileID]
    }).then(res => {
      if (res.fileList && res.fileList.length > 0) {
        this.setData({
          bgImageUrl: res.fileList[0].tempFileURL
        });
      }
    }).catch(err => {
      console.error('获取背景图失败', err);
    });
  },

  // 选择图片并生成3D模型
  async chooseImageAndGenerate() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({ progressTip: '上传图片中...', isGenerating: true });

        try {
          // ========== 新增：保存原图作为缩略图 ==========
          const uploadRes = await wx.cloud.uploadFile({
            cloudPath: `input_images/${Date.now()}.jpg`,
            filePath: tempFilePath
          });
        
          // 再保存缩略图
          const thumbSaveRes = await new Promise((resolve, reject) => {
            wx.saveFile({
              tempFilePath: tempFilePath,
              success: resolve,
              fail: reject
            });
          });
          const thumbPath = thumbSaveRes.savedFilePath;
          this.setData({ currentThumbPath: thumbPath });
        
          // 继续原来的逻辑...
          this.setData({ progressTip: '提交生成任务中...' });
          // 3. 调用提交云函数
          /*const submitRes = await wx.cloud.callFunction({
            name: 'submit3dJob',
            data: { imageUrl }
          });

          if (!submitRes.result.success) {
            throw new Error(submitRes.result.error || '提交任务失败');
          }

          const taskId = submitRes.result.taskId;
          this.setData({ progressTip: '模型生成中，请稍候...' });

          // 4. 轮询查询结果
          let finished = false;
          let modelUrl = '';
          const maxAttempts = 60;
          for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000));

            const queryRes = await wx.cloud.callFunction({
              name: 'query3dJob',
              data: { taskId }
            });

            if (!queryRes.result.success) {
              throw new Error(queryRes.result.error);
            }

            const { status, pbrModelUrl: url, error } = queryRes.result;
            if (status === 'success') {
              modelUrl = url;
              finished = true;
              break;
            } else if (status === 'failed') {
              throw new Error(error || '生成失败');
            }
            this.setData({ progressTip: `生成中...已等待 ${(i+1)*3} 秒` });
          }

          if (!finished) {
            throw new Error('生成超时，请稍后重试');
          }*/
          // 5. 保存模型URL到 data
          this.setData({
            generatedModelUrl:           'https://tripo-data.rg1.data.tripo3d.com/tcli_69d203a6f59b468ea8f6158e8ca218d1/20260315/9dbc50fc-ea4a-4337-a1bf-2e37e711282a/tripo_pbr_model_9dbc50fc-ea4a-4337-a1bf-2e37e711282a.glb?Key-Pair-Id=K1676C64NMVM2J&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly90cmlwby1kYXRhLnJnMS5kYXRhLnRyaXBvM2QuY29tL3RjbGlfNjlkMjAzYTZmNTliNDY4ZWE4ZjYxNThlOGNhMjE4ZDEvMjAyNjAzMTUvOWRiYzUwZmMtZWE0YS00MzM3LWExYmYtMmUzN2U3MTEyODJhL3RyaXBvX3Bicl9tb2RlbF85ZGJjNTBmYy1lYTRhLTQzMzctYTFiZi0yZTM3ZTcxMTI4MmEuZ2xiIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzczNjE5MjAwfX19XX0_&Signature=Bfb8DW4oVluszZqFlolpDpyon1pDm~jDsxmx73Z8wlIR9NM9EPA6csYUxCb09vS3kk0qMZb77hrGKh5AN2CeRAY71uNv3soPnkbyMyEVRoBX1Mh5VeGyGz28kWJbK81PFKYyVy59~WXO0Q9W7Y0OSPHNM7HFNLZhmdzll4ALIAV8YT7eIsatJQYETKI-42qAX3wSSrxBHsphCaRGUdle~GIptVzbiYfIzMt4A1dHzW0SY8P41Du9vWnbz-GxVKrxHG-j1rU9v0IBpBTcWuNh8q0uGMkotSu4vp2jHIltp1CHhZO3CG5TjnKBXsmM2xdlgCeh44-4nn2K856bwvye2w__',
            //modelUrl,
            progressTip: ''
          });

          // ========== 新增：自动保存模型到缓存 ==========
          await this.autoSaveModelToCache(); // 调用自动保存函数
          // ============================================

          wx.showModal({
            title: '生成成功',
            content: '3D模型已生成，是否现在打开AR摄像头查看？',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.setData({ showAR: true });
              }
            }
          });

        } catch (err) {
          console.error('生成过程出错', err);
          wx.showToast({
            title: err.message || '操作失败',
            icon: 'none'
          });
        } finally {
          this.setData({ isGenerating: false, progressTip: '' });
        }
      }
    });
  },

  // 新增：自动保存模型（整合原 saveModelToCache 逻辑并加入缩略图）
  async autoSaveModelToCache() {
    const { generatedModelUrl, currentThumbPath } = this.data;
    if (!generatedModelUrl) {
      console.warn('没有模型可保存');
      return;
    }

    wx.showLoading({ title: '保存模型中...' });

    try {
      // 下载模型文件
      const downloadRes = await new Promise((resolve, reject) => {
        wx.downloadFile({
          url: generatedModelUrl,
          success: resolve,
          fail: reject
        });
      });

      if (downloadRes.statusCode !== 200) {
        throw new Error('下载失败');
      }

      // 保存到本地缓存
      const saveRes = await new Promise((resolve, reject) => {
        wx.saveFile({
          tempFilePath: downloadRes.tempFilePath,
          success: resolve,
          fail: reject
        });
      });

      // 更新缓存路径（用于显示）
      this.setData({ modelCachedPath: saveRes.savedFilePath });

      // 将模型信息存入 modelList，附带缩略图路径
      let modelList = wx.getStorageSync('modelList') || [];
      const newModel = {
        filePath: saveRes.savedFilePath,
        thumbUrl: currentThumbPath || '', // 使用之前保存的缩略图路径
        name: '模型_' + new Date().toLocaleString(),
        createTime: new Date().toLocaleString()
      };
      modelList.unshift(newModel);
      wx.setStorageSync('modelList', modelList);

      // 清除临时缩略图路径（可选）
      this.setData({ currentThumbPath: '' });

      wx.hideLoading();
      wx.showToast({ title: '已保存到缓存', icon: 'success' });
      console.log('模型已自动保存，路径：', saveRes.savedFilePath);

    } catch (err) {
      wx.hideLoading();
      console.error('自动保存失败', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  loadFirstModelFromCache() {
    const modelList = wx.getStorageSync('modelList') || [];
    if (modelList.length > 0) {
      const firstModel = modelList[0];
      this.setData({
        CacheModelUrl: firstModel.filePath
      });
      console.log('已加载缓存模型：', firstModel.filePath);
    } else {
      console.log('缓存中暂无模型，将使用默认模型');
    }
  },

  // 原保存函数已废弃，但保留供参考（现在自动保存覆盖了它）
  // saveModelToCache() { ... } 可以删除或保留，为防出错暂时保留但不再使用
  saveModelToCache() {
    // 此函数已不再需要，自动保存已在生成后执行
    wx.showToast({ title: '已自动保存', icon: 'none' });
  },

  goToModels() {
    wx.navigateTo({
      url: '/pages/models/models'
    });
  },

  openAR() {
    this.setData({ showAR: true });
  },
  closeAR() {
    this.setData({ showAR: false });
  }
});