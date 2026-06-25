<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
      <!-- 标题栏 -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">扫码添加食物</h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- 扫码区域 -->
      <div class="p-4">
        <!-- 摄像头容器 -->
        <div v-if="!scanning && !result" class="relative">
          <div class="bg-gray-100 rounded-lg p-8 text-center">
            <Icons name="barcode" size="xl" class="text-gray-400 mx-auto mb-3" />
            <p class="text-sm text-gray-600 mb-4">将条形码对准摄像头</p>
            <button
              @click="startScanning"
              class="px-6 py-2 bg-health-green text-white rounded-lg hover:bg-health-green-dark transition-colors"
            >
              开始扫码
            </button>
          </div>
        </div>

        <!-- 扫码中 -->
        <div v-else-if="scanning && !result" class="relative">
          <video ref="videoElement" class="w-full rounded-lg"></video>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-64 h-32 border-2 border-health-green rounded-lg animate-pulse"></div>
          </div>
          <button
            @click="stopScanning"
            class="mt-3 w-full py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>

        <!-- 扫码结果 -->
        <div v-else-if="result" class="space-y-4">
          <!-- 食物信息 -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-start gap-3">
              <Icons name="check-circle" size="lg" class="text-green-600 flex-shrink-0" />
              <div class="flex-1">
                <h4 class="font-medium text-gray-800">{{ result.name }}</h4>
                <p class="text-sm text-gray-500">{{ result.brand }}</p>
                <div class="mt-2 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div class="text-xs text-gray-500">热量</div>
                    <div class="font-medium text-gray-800">{{ result.calories }}<span class="text-xs">kcal</span></div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">蛋白质</div>
                    <div class="font-medium text-gray-800">{{ result.protein }}<span class="text-xs">g</span></div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">碳水</div>
                    <div class="font-medium text-gray-800">{{ result.carbs }}<span class="text-xs">g</span></div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">脂肪</div>
                    <div class="font-medium text-gray-800">{{ result.fat }}<span class="text-xs">g</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 重量输入 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">食用重量 (g)</label>
            <input
              v-model.number="servingSize"
              type="number"
              min="1"
              max="1000"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-500"
              placeholder="100"
            />
          </div>

          <!-- 计算结果 -->
          <div class="p-3 bg-health-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">总热量</span>
              <span class="text-lg font-bold text-health-600">{{ calculatedCalories }} kcal</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <button
              @click="resetScanner"
              class="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              重新扫码
            </button>
            <button
              @click="addFood"
              class="flex-1 py-2 bg-health-green text-white rounded-lg hover:bg-health-green-dark transition-colors"
            >
              添加到记录
            </button>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="p-4 bg-red-50 rounded-lg">
          <div class="flex items-start gap-2">
            <Icons name="x-circle" size="md" class="text-red-600 flex-shrink-0" />
            <div>
              <h4 class="font-medium text-red-800">未找到该食品</h4>
              <p class="text-sm text-red-700 mt-1">条形码：{{ error }}</p>
              <p class="text-xs text-red-600 mt-2">请尝试手动输入或扫描其他食品</p>
            </div>
          </div>
          <button
            @click="resetScanner"
            class="mt-3 w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重新扫码
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/library'
import Icons from '@/components/icons/Icons.vue'

const emit = defineEmits<{
  close: []
  add: [{
    name: string
    brand: string
    barcode: string
    calories: number
    protein: number
    carbs: number
    fat: number
    servingSize: number
    totalCalories: number
  }]
}>()

const videoElement = ref<HTMLVideoElement | null>(null)
const scanning = ref(false)
const result = ref<{
  name: string
  brand: string
  barcode: string
  calories: number
  protein: number
  carbs: number
  fat: number
} | null>(null)
const error = ref<string | null>(null)
const servingSize = ref(100)

let codeReader: BrowserMultiFormatReader | null = null

// 计算总热量
const calculatedCalories = computed(() => {
  if (!result.value) return 0
  return Math.round((result.value.calories * servingSize.value) / 100)
})

// 开始扫码
async function startScanning() {
  scanning.value = true
  error.value = null

  try {
    codeReader = new BrowserMultiFormatReader()

    // 获取摄像头权限并启动
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })

    if (videoElement.value) {
      videoElement.value.srcObject = stream
      await videoElement.value.play()

      // 持续监听扫码结果
      codeReader.decodeFromVideoElement(videoElement.value)
        .then((result: any) => {
          if (result) {
            const barcode = typeof result.getText === 'function' ? result.getText() : result.text
            if (barcode) {
              handleBarcodeScanned(barcode)
            }
          }
        })
        .catch((err: any) => {
          console.error('扫码错误:', err)
          // 忽略正常停止的错误
          if (scanning.value) {
            error.value = '扫码失败，请重试'
          }
        })
    }
  } catch (err) {
    console.error('摄像头启动失败:', err)
    error.value = '无法访问摄像头'
    scanning.value = false
  }
}

// 停止扫码
function stopScanning() {
  if (codeReader) {
    codeReader.reset()
    codeReader = null
  }
  scanning.value = false
}

// 处理条形码
async function handleBarcodeScanned(barcode: string) {
  console.log('扫描到条形码:', barcode)
  stopScanning()

  try {
    // 查询 OpenFoodFacts API
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    )
    const data = await response.json()

    console.log('API 返回数据:', data)

    if (data.product) {
      const product = data.product
      result.value = {
        name: product.product_name || product.product_name_zh_cn || '未知食品',
        brand: product.brands || '未知品牌',
        barcode,
        calories: product.nutriments?.['energy-kcal_100g'] || 0,
        protein: product.nutriments?.proteins_100g || 0,
        carbs: product.nutriments?.carbohydrates_100g || 0,
        fat: product.nutriments?.fat_100g || 0,
      }
      console.log('解析结果:', result.value)
    } else {
      error.value = barcode
      console.log('未找到商品')
    }
  } catch (err) {
    console.error('查询失败:', err)
    error.value = barcode
  }
}

// 重置扫码器
function resetScanner() {
  result.value = null
  error.value = null
  servingSize.value = 100
  startScanning()
}

// 添加食物到记录
function addFood() {
  if (!result.value) return

  emit('add', {
    ...result.value,
    servingSize: servingSize.value,
    totalCalories: calculatedCalories.value,
  })

  emit('close')
}
</script>
