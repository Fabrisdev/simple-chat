DOMPurify.setConfig({
  ALLOWED_TAGS: []
})

const client = supabase.createClient(
  'https://owadylskomxwchwaxify.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YWR5bHNrb214d2Nod2F4aWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzQyMjQxNDAsImV4cCI6MTk4OTgwMDE0MH0.99kR6xuX-KclTvYU78Gx_0fwPfOGFak3swaW-tJ3Org',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

const cardsContainer = document.querySelector('#cards-container')

async function getMessages(){
  const { data } = await client
    .from('messages')
    .select('*')
  return data
}

async function showMessages(){
  const messages = await getMessages()
  messages.forEach(data => {
    const actualCardsContainerHTML = cardsContainer.innerHTML
    const { username, content, sent_at } = data
    cardsContainer.innerHTML = `${actualCardsContainerHTML}
      <div class="card">
        <div class="user-container">
          <img class="profile-picture" src="https://saltoshopping.com.uy/wp-content/uploads/2018/08/Nu%C3%B1ez.jpg" width="120px" height="120px">
          <h3 class="username">${DOMPurify.sanitize(username)}</h3>
        </div>
        <p class="content">${DOMPurify.sanitize(content)}</p>
        <p class="sent-at">${DOMPurify.sanitize(sent_at)}</p>
      </div>
    `
  })
  cardsContainer.scrollTop = cardsContainer.scrollHeight;
}

showMessages()


client
  .channel('public:messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
    const actualCardsContainerHTML = cardsContainer.innerHTML
    const { username, content, sent_at } = payload.new
    cardsContainer.innerHTML = `${actualCardsContainerHTML}
      <div class="card">
      <div class="user-container">
        <img class="profile-picture" src="https://saltoshopping.com.uy/wp-content/uploads/2018/08/Nu%C3%B1ez.jpg" width="120px" height="120px">
        <h3 class="username">${username}</h3>
      </div>
      <p class="content">${content}</p>
      <p class="sent-at">${sent_at}</p>
      </div>
    `
    cardsContainer.scrollTop = cardsContainer.scrollHeight;
  })
  .subscribe()

const form = document.querySelector('#message-form')
form.addEventListener('submit', event => {
  event.preventDefault()
  const username = form.elements.username.value
  const content = form.elements.content.value
  sendMessage(username, content)
})

async function sendMessage(username, content){
  await client
    .from('messages')
    .insert({ username, content })
}