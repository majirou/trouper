<template lang="pug">
  .modal-mask
    .modal-wrapper
      .modal-container
        .container-fluid
          .row
            .col-12.mb-3
              .input-group
                input.form-control(
                  type="text"
                  placeholder="スクレイプ対象URL"
                  v-model="targetUrl"
                )
                .input-group-append
                  button.btn.btn-primary(@click="getTargetSite") 取得
            .col-12.mb-3
              iframe.w-100.h-100.border.border-info.rounded(
                type  = "text/html"
                :id   = "iframeId"
                :src  = "iframeSource"
                @load = "iframeLoaded"
              )
            .col-12
              .active-element
                .card
                  .card-header.py-1 選択中の要素
                  .card-body.p-1
                    .card-title
                    ul
                      li TAG:
                      li ID:
                      li CLASS:
                      li NAME:
                      li INDEX:
</template>

<script>
export default {
  name: 'ProgramForm',
  data () {
    return {
      name: 'Scenario',
      targetUrl: null,
      iframeId: 'iframeId',
      iframeSource: null,
      scrapingApiUrl: '/temporary'
    }
  },
  methods: {
    getTargetSite () {
      try {
        const reg = new RegExp("((https?)(://[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+))")

        if (this.targetUrl == null) {
          throw new Error('Input URL')
        }
        if (!this.targetUrl.match(reg)) {
          throw new Error('Begin the URL with http or https')
        }

        this.$lock('Getting HTML...')
        const targetUrl = `${this.scrapingApiUrl}/?url=${this.targetUrl}`
        console.log('targetUrl', this.scrapingApiUrl, this.targetUrl)
        this.$axios.get(targetUrl)
          .then((res) => {
            if (res.status !== 200) {
              throw new Error('error')
            }
            console.log(res)
            this.iframeSource = `/data/temporary/${res.data.result.dirName}/`
            // this.scrapedUrl = this.url
          })
          .catch((err) => {
            this.setWarningMessage(err.message)
            console.error(err)
            this.$unlock()
          })
      } catch (err) {
        this.setWarningMessage(err.message)
        console.error(err)
        this.$unlock()
      }
    },
    iframeLoaded () {
      console.log('iframe is loaded')
      try {
        const iframe = document.getElementById(this.iframeId)
        if (iframe == null || iframe.src == null) {
          throw new Error('iframe source is empty')
        }

        const contentWindow = iframe.contentWindow
        if (iframe.contentWindow == null) {
          throw new Error('iframe content is empty')
        }

        // postMessageにて、iframeとのやりとりを実現する
        contentWindow.postMessage({ type: 'init' }, '*')
        // this.$unlock()
      } catch (err) {
        this.setWarningMessage(err.message)
        console.error(err)
      }
    },
    setWarningMessage (message) {
      console.log('setWarningMessage')
      this.$emit('message', 3, message)
    },
    setInformationMessage (message) {
      console.log('setInformationMessage')
      this.$emit('message', 1, message)
    }
  }
}
</script>

<style lang="scss" scoped>
  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
    padding: 1em;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
    height: 100%;
  }

  .modal-container {
    margin: 0px auto;
    padding: 1em 0;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
  }

  .modal-enter {
    opacity: 0;
  }

  .modal-leave-active {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>
