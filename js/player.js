// Music Player Application
class MusicPlayer {
    constructor() {
        // Audio element
        this.audio = document.getElementById('audioPlayer');
        
        // Current state
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isShuffleOn = false;
        this.repeatMode = 'off'; // 'off', 'all', 'one'
        
        // DOM elements
        this.albumArt = document.getElementById('albumArt');
        this.songTitle = document.getElementById('songTitle');
        this.artistName = document.getElementById('artistName');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.getElementById('progress');
        this.progressHandle = document.getElementById('progressHandle');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');
        this.playlistContainer = document.getElementById('playlist');
        
        // Initialize
        this.init();
    }
    
    init() {
        // Load playlist
        this.loadPlaylist();
        
        // Set initial volume
        this.audio.volume = this.volumeSlider.value / 100;
        
        // Event listeners
        this.setupEventListeners();
        
        // Load first song info (without playing)
        this.loadSong(0);
    }
    
    setupEventListeners() {
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // Previous button
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        
        // Next button
        this.nextBtn.addEventListener('click', () => this.playNext());
        
        // Shuffle button
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        
        // Repeat button
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Progress bar
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        
        // Volume slider
        this.volumeSlider.addEventListener('input', (e) => this.changeVolume(e));
        
        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    loadPlaylist() {
        this.playlistContainer.innerHTML = '';
        
        songData.forEach((song, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            playlistItem.dataset.index = index;
            
            playlistItem.innerHTML = `
                <img src="${song.image}" alt="${song.title}" class="playlist-item-image">
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${song.title}</div>
                    <div class="playlist-item-artist">${song.artist}</div>
                </div>
                <div class="playlist-item-number">${song.id}</div>
            `;
            
            playlistItem.addEventListener('click', () => {
                this.loadSong(index);
                this.play();
            });
            
            this.playlistContainer.appendChild(playlistItem);
        });
    }
    
    loadSong(index) {
        // Validate index
        if (index < 0 || index >= songData.length) return;
        
        const song = songData[index];
        this.currentSongIndex = index;
        
        // Update audio source
        this.audio.src = song.audio;
        
        // Update UI
        this.albumArt.src = song.image;
        this.songTitle.textContent = song.title;
        this.artistName.textContent = song.artist;
        
        // Update playlist active state
        this.updatePlaylistUI();
        
        // Update document title
        document.title = `${song.title} - ${song.artist}`;
    }
    
    play() {
        this.audio.play();
    }
    
    pause() {
        this.audio.pause();
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    onPlay() {
        this.isPlaying = true;
        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.playPauseBtn.title = 'Pause';
        this.albumArt.classList.add('playing');
        this.updatePlaylistUI();
    }
    
    onPause() {
        this.isPlaying = false;
        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.playPauseBtn.title = 'Play';
        this.albumArt.classList.remove('playing');
        this.updatePlaylistUI();
    }
    
    playNext() {
        let nextIndex;
        
        if (this.isShuffleOn) {
            // Random next song (but not current)
            do {
                nextIndex = Math.floor(Math.random() * songData.length);
            } while (nextIndex === this.currentSongIndex && songData.length > 1);
        } else {
            // Sequential next
            nextIndex = (this.currentSongIndex + 1) % songData.length;
        }
        
        this.loadSong(nextIndex);
        this.play();
    }
    
    playPrevious() {
        // If more than 3 seconds played, restart current song
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
        } else {
            // Go to previous song
            let prevIndex = (this.currentSongIndex - 1 + songData.length) % songData.length;
            this.loadSong(prevIndex);
            this.play();
        }
    }
    
    toggleShuffle() {
        this.isShuffleOn = !this.isShuffleOn;
        this.shuffleBtn.classList.toggle('active', this.isShuffleOn);
        
        // Update title
        this.shuffleBtn.title = this.isShuffleOn ? 'Shuffle On' : 'Shuffle Off';
    }
    
    toggleRepeat() {
        // Cycle through: off -> all -> one -> off
        if (this.repeatMode === 'off') {
            this.repeatMode = 'all';
            this.repeatBtn.classList.add('active');
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
            this.repeatBtn.title = 'Repeat All';
        } else if (this.repeatMode === 'all') {
            this.repeatMode = 'one';
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i><span style="position: absolute; font-size: 0.7rem; font-weight: bold;">1</span>';
            this.repeatBtn.title = 'Repeat One';
        } else {
            this.repeatMode = 'off';
            this.repeatBtn.classList.remove('active');
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
            this.repeatBtn.title = 'Repeat Off';
        }
    }
    
    handleSongEnd() {
        if (this.repeatMode === 'one') {
            // Repeat current song
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 'all' || this.currentSongIndex < songData.length - 1) {
            // Play next song
            this.playNext();
        } else {
            // End of playlist, stop
            this.pause();
            this.audio.currentTime = 0;
        }
    }
    
    updateProgress() {
        if (!this.audio.duration) return;
        
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = `${percent}%`;
        this.progressHandle.style.left = `${percent}%`;
        
        // Update current time
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }
    
    updateDuration() {
        if (!this.audio.duration) return;
        this.durationEl.textContent = this.formatTime(this.audio.duration);
    }
    
    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
    }
    
    changeVolume(e) {
        const volume = e.target.value;
        this.audio.volume = volume / 100;
        this.volumeValue.textContent = `${volume}%`;
        
        // Update volume icon
        const volumeIcon = document.querySelector('.volume-icon');
        if (volume == 0) {
            volumeIcon.className = 'fas fa-volume-mute volume-icon';
        } else if (volume < 50) {
            volumeIcon.className = 'fas fa-volume-down volume-icon';
        } else {
            volumeIcon.className = 'fas fa-volume-up volume-icon';
        }
    }
    
    updatePlaylistUI() {
        const items = document.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            item.classList.remove('active', 'playing');
            
            if (index === this.currentSongIndex) {
                item.classList.add('active');
                
                if (this.isPlaying) {
                    item.classList.add('playing');
                    item.querySelector('.playlist-item-number').innerHTML = '<i class="fas fa-volume-up playlist-item-playing-icon"></i>';
                } else {
                    item.querySelector('.playlist-item-number').textContent = songData[index].id;
                }
            } else {
                item.querySelector('.playlist-item-number').textContent = songData[index].id;
            }
        });
        
        // Scroll to active item
        const activeItem = document.querySelector('.playlist-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    handleKeyboard(e) {
        // Prevent default if we handle the key
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.audio.currentTime = Math.min(this.audio.currentTime + 5, this.audio.duration);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.audio.currentTime = Math.max(this.audio.currentTime - 5, 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.volumeSlider.value = Math.min(parseInt(this.volumeSlider.value) + 10, 100);
                this.changeVolume({ target: this.volumeSlider });
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.volumeSlider.value = Math.max(parseInt(this.volumeSlider.value) - 10, 0);
                this.changeVolume({ target: this.volumeSlider });
                break;
            case 'KeyN':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.playNext();
                }
                break;
            case 'KeyP':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.playPrevious();
                }
                break;
            case 'KeyS':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleShuffle();
                }
                break;
            case 'KeyR':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleRepeat();
                }
                break;
        }
    }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const player = new MusicPlayer();
    
    // Make player globally accessible for debugging
    window.musicPlayer = player;
    
    console.log('%c🎵 Music Player Loaded Successfully! 🎵', 'color: #6366f1; font-size: 16px; font-weight: bold;');
    console.log('%cKeyboard Shortcuts:', 'color: #8b5cf6; font-weight: bold;');
    console.log('Space - Play/Pause');
    console.log('Arrow Right/Left - Seek +/- 5 seconds');
    console.log('Arrow Up/Down - Volume +/- 10%');
    console.log('Ctrl+N - Next Song');
    console.log('Ctrl+P - Previous Song');
    console.log('Ctrl+S - Toggle Shuffle');
    console.log('Ctrl+R - Toggle Repeat');
});

