$(document).ready(()=>{

let listFromClient = $('.titles-list li .url').get();

function highLigth(element) {
   $.each( listFromClient, ( key, value )=> {
     let url = $(value).text();
      if(url === element){
        $(value).closest('li').addClass('effect');
      }

   });
 }

 if( $('.hidden-urls').length !==0){
   let urlFromDb = $('.hidden-urls').val().split(',');
   if(urlFromDb.length > 1) {
     $.each(urlFromDb, (k, v)=>{
         highLigth(v);
       });
   }else{
       highLigth( urlFromDb[0] ) ;
     };


 }

 $('.add-input').click(()=>{

    $('.urls-inputs').append("<input type='text' class='form-control url-input' name='url' id='exampleInputEmail1' value='' placeholder='https://google.com' required> <span class='glyphicon glyphicon-trash delete-input' aria-hidden='true'>  </span>")

 });


 $(document).on('click', '.delete-input',  function(){

   $(this).prev().remove();
   $(this).remove();

 })



 $('.submit-button').click(function(){
     if( $('.url-input').val() !== ''){
           $.LoadingOverlay("show");
     }
 })

})
