<script setup lang="ts">
import SignInForm from './components/SignInForm.vue'
</script>

<template>
  <div class="h-screen flex flex-col md:flex-row">
    <div class="h-full md:w-1/2 xl:w-11/12 flex items-center justify-center">
      <SignInForm />
    </div>

    <div
      class="h-96 md:h-screen flex items-center justify-center bg-cover bg-no-repeat bg-bottom md:w-1/2 xl:1/12 p-8 bg-sign-in"
    >
      <div class="text-center bg-white bg-opacity-60 rounded-md shadow-sm p-8">
        <h1 class="text-3xl font-bold mb-4">Login</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat in voluptate aspernatur
          quaerat enim suscipit itaque voluptatibus repellendus, eaque sunt!
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis deleniti et est ratione
          aspernatur cupiditate?
        </p>
      </div>
    </div>
  </div>
</template>
