const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = [] // 電影總清單
let filteredMovies = [] // 儲存符合篩選條件的項目

const MOVIES_PER_PAGE = 12 // 每頁顯示12筆電影資料

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// 函式：計算所有電影數量需要的頁數，每頁顯示電影數量：MOVIES_PER_PAGE
function renderPaginator(amount) {
  // 計算總頁數 
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  // 製作 template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    // 將page存入dataset，取用頁碼
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  // 放回HTML
  paginator.innerHTML = rawHTML
}

// 函式：電影新增分頁顯示，每頁顯示電影數量：MOVIES_PER_PAGE
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
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

// 函式：將點選“＋”的該部電影送進local storage儲存
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單內')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 監聽：dataPanel內的點擊事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // 顯示更多電影資料
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    // 加入至喜愛電影的清單中
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監聽：searchForm內的提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 預防瀏覽器預設行為
  event.preventDefault()
  // 取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()

  // 錯誤處理方法一：輸入無效字串
  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }
  // 【作法一】用迴圈迭代：for-of
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  // 【作法二】用條件來迭代：filter
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  // 錯誤處理方法二：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的字：${keyword} 沒有符合條件的電影`)
  }
  // 重新渲染符合搜尋的電影清單
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

// 監聽：pagintor內的點擊事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 點擊的標籤若不是a，則結束
  if (event.target.tagName !== 'A') return

  // 透過dataset取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  // 更新畫面
  renderMovieList(getMoviesByPage(page))
})

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))