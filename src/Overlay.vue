<template>
  <Modal id="overlay">
    <p>Choose provider</p>
    <ListItem
      v-for="p in providers.filter(p => developerMode || p.isAvailable())"
      :key="p.name"
      :title="p.name"
      @click="$emit('select', p)"
    >
      <img
        slot="icon"
        :src="p.icon"
      />
    </ListItem>
  </Modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ListItem from 'aepp-base/src/components/ListItem.vue';
import Modal from 'aepp-base/src/components/mobile/Modal.vue';

@Component({
  components: {
    Modal,
    ListItem,
  },
})
export default class Overlay extends Vue {
  @Prop() private providers!: Provider[];

  @Prop() private developerMode: boolean = false;
}
</script>

<style lang="scss">
@import '~aepp-base/src/styles/typography';

#overlay p {
  font-family: $font-sans;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
