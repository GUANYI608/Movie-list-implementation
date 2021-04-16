const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

// 修改為：localStorage上存取的資料
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

const dataPanel = document.querySelector('#data-panel')

// 函式：渲染電影資料 
function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    // Use: card with Grid system
    // 12 per row, set 3 to display 4 movies per row
    // title與image須隨movie資料變更
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <!-- Button trigger modal -->
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// 函式：彈出視窗顯示詳細的單部電影資料
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    //response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

// 函式：從喜愛清單中移除電影
function removeFromFavorite(id) {
  // 這裡加上兩個條件控制：
  // (1) 當收藏清單是空的：movies為undefined or null時（Boolean為false），加上!後，條件式則判斷為true，就結束函式
  if (!movies) return

  // 設定一個新的常數：當movies內搜尋到第一個物件的id與點選的電影id相等時，findIndex則結束並回傳該物件的陣列位置；若所有元素都不符合時則回傳-1
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  // (2) 一旦傳入的 id 在收藏清單中不存在（回傳-1時)，就結束函式
  if (movieIndex === -1) return
  // 將movieIndex（符合條件的index)帶入splice將得到的該陣列位置中的資料從陣列中刪除
  movies.splice(movieIndex, 1)
  // 將更新後的movies帶入localStorage內，此時可以看到devTools中的localStorage會更新
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  // 重新渲染更新後的movies資料，否則畫面上刪除的電影會於重新整理頁面後才更新
  renderMovieList(movies)
}

// 監聽：dataPanel內的點擊事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // 顯示更多電影資料
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    // 加入至喜愛電影的清單中
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)
console.log(movies)