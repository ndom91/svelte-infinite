<script lang="ts">
  const { user } = $props<{ user: { id: number; body: string } }>()
</script>

<div class="container">
  <img
    src={`https://source.boringavatars.com/marble/120/${user.id}?colors=0A0310,49007E,FF005B,FF7D10,FFB238`}
    alt="User Avatar"
  />
  <div class="content">
    {user.body}
  </div>
  <div class="counter">
    {user.id}
  </div>
</div>

<style>
  .container {
    display: flex;
    width: 100%;
    position: relative;
    align-items: center;
    gap: 1rem;
    border-radius: 0.5rem;
    background-color: #ddd;
    padding: 1rem;
    margin-bottom: 1rem;

    .content {
      margin-right: 2rem;
      text-overflow: ellipsis;
      overflow: hidden;
      -webkit-box-orient: vertical;
      line-clamp: 3;
      -webkit-line-clamp: 3;
      display: -webkit-box;
    }
    .counter {
      position: absolute;
      top: 0;
      right: 0;
      padding: 0.75rem;
      background-color: #fff;
      border-radius: 0 0.5rem 0 0.5rem;
    }
    img {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      margin: 1rem;
    }
  }
  @media (max-width: 768px) {
    .container img {
      width: 64px;
      height: 64px;
      margin: 0.5rem;
    }
  }
</style>
