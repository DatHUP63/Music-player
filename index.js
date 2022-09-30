const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const PLAYER_STORAGE_KEY ='F8_PLAYER'

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: "Em Đây Chẳng Phải Thúy Kiều",
            singer: "Hoàng Thùy Linh",
            path: "./assets/music/Hoàng Thùy Linh - Em Đây Chẳng Phải Thúy Kiều (I Am Not Thuy Kieu) - Official Lyrics Video.mp3",
            image: "./assets/Image/Hoang thuy linh.JPG"
          },
        {
          name: "Hello",
          singer: "Adele",
          path: "./assets/music/Adele - Hello.mp3",
          image: "./assets/Image/Adele.JPG"
  
        },
        {
          name: "Love Me Like You Do",
          singer: "Ellie Goulding",
          path: "./assets/music/Ellie Goulding - Love Me Like You Do (Official Video).mp3",
          image: "./assets/Image/love me like you do.JPG"
        },
        {
          name: "THE PLAYAH",
          singer: "SOOBIN X SLIMV",
          path: "./assets/music/SOOBIN X SLIMV - THE PLAYAH (Special Performance - Official Music Video).mp3",
          image: "./assets/Image/Soobin.JPG"
        },
        {
          name: "Love Story",
          singer: "Taylor Swift",
          path: "./assets/music/Taylor Swift - Love Story.mp3",
          image: "./assets/Image/Taylor.JPG"
        },
        {
          name: "Nevada",
          singer: "Vicetone",
          path: "./assets/music/Vicetone - Nevada.mp3",
          image: "./assets/Image/Vicetone - Nevada.jpg"
        },
        {
          name: "My Love",
          singer: "Westlife",
          path: "./assets/music/Westlife - My Love (Official Video).mp3",
          image: "./assets/Image/Westlife.JPG"
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))

    },

    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song" ${index === this.currentIndex ? 'active': ''} data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        }) 
    },

    handleEvents: function(){
        const _this = this
        const cdWidth = cd.offsetWidth

        // Zoom in/zoom out CD
        document.onscroll = function() {
            const scrollTop = window.screenY || document.documentElement.scrollTop
            const newcdWidth = cdWidth - scrollTop
            cd.style.width = newcdWidth > 0 ? newcdWidth + 'px' : 0
            cd.style.opacity = newcdWidth/cdWidth
        }

        // Click play button
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        
        // Play music
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Stop music
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //Update progress when playing a song
        audio.ontimeupdate = function(){
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime/audio.duration*100)
                progress.value = progressPercent
            }
        }

        // Seek a song
        progress.onchange = function(e) {
            const seekTime = (e.target.value*audio.duration/100)
            audio.currentTime = seekTime
        }

        // Rotate the CD when playing a song
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Click next button
        nextBtn.onclick = function(){
            if(_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
        }

        // Click prev button
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong()
            } else {
                _this.prevSong()
            } 
            audio.play()
            _this.render()
        }

        // Click random button
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active')
        }

        // Play other song/repeat when current song ends
        audio.onended = function(){
            if(_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Click repeat button
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active')
        }

        // Click on a song of playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) 
            {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                }
            }
        }


    },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex > this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    randomSong: function(){
        let newCurrentIndex
        do {
            newCurrentIndex = Math.floor(Math.random() * this.songs.length)
        } while (newCurrentIndex == this.currentIndex)
        this.currentIndex = newCurrentIndex
        this.loadCurrentSong()  
    },

    ScrollToActiveSong: function(){
        setTimeout(function(){
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 200)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = getConfig
    },

    start: function(){
        // Define atttributes to object
        this.defineProperties()

        // Listen to/execute DOM events
        this.handleEvents()

        //Load current song
        this.loadCurrentSong()

        // Render playlist
        this.render()
    },
}

app.start()