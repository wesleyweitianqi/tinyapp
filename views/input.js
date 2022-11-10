export const input = document.querySelector(".form-control")
input.addEventListener("click", ()=> {
  input.textContent = "http://";
  console.log(input);
})

