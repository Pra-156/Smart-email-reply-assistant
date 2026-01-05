import { useState } from 'react'
import './App.css'
import { Container, Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Button } from '@mui/material';
import axios from 'axios';
function App() {
  const [emailContent, setEmailContent] = useState('');
   const [tone, setTone] = useState('');
   const [generatedReply,setGeneratedReply] = useState('');
    const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');

     const handleSubmit = async() =>{
      setLoading(true);
      setError(' ');
      try{
        const response = await axios.post("http://localhost:8080/api/email/generate",{
          emailContent,
          tone
        });

        console.log("response data", response.data);
        setGeneratedReply(typeof response.data==='string'? response.data : JSON.stringify(response.data));
      }catch(error){
       setError('failed  to generate reply please try again.');
       console.error(error);
      }finally{
        setLoading(false);
      }
     };


  return (
    <>
     <Container maxWidth="md" sx={{py:4}}>
       <Typography variant='h3' component="h1" gutterBottom>
        Email Reply Generator
       </Typography>
       <Box sx={{my:3}}>
         <TextField
           fullWidth
           multiline
           rows={6}
           variant="outlined"
           label="Email Content"
           placeholder="Paste the email you want to reply to..."
           value={emailContent}
           onChange={(e)=>setEmailContent(e.target.value)}
           sx={{mb:2}}
          />
         <FormControl fullWidth sx={{mb:2}}>
          <InputLabel>Tone (Optional)</InputLabel>
          <Select 
            value={tone}
            label="Tone (Optional)"
            onChange={(e)=>setTone(e.target.value)}
          >
           <MenuItem value="">None</MenuItem> 
           <MenuItem value="professional">Professional</MenuItem> 
           <MenuItem value="casual">Casual</MenuItem> 
           <MenuItem value="friendly">Friendly</MenuItem> 
          </Select>
         </FormControl>

         <Button
         variant='contained'
         onClick={handleSubmit}
         disabled={!emailContent || loading}>
          {loading ? <CircularProgress size={24}/>: "Generate Reply"}
         </Button>
       </Box>
       {
        error &&(
           <Typography color='error'gutterBottom sx={{mb:2}}>
            {error}
        
       </Typography>
        )}

       {
        generatedReply &&(
          <Box sx={{mt:3}}>
            <Typography variant='h6' gutterBottom>
              generated Reply
            </Typography>
            <TextField
            fullWidth
            multiline
            rows={6}
            variant='outlined'
            value={generatedReply || ''}
            inputProps={{readOnly:true}}
            />
            <Button variant='outlined'
            sx={{mt:2}}
            onClick={()=>navigator.clipboard.writeText(generatedReply)}>
              Copy to clipboard
            </Button>
            <Typography>{generatedReply.header}</Typography>
          </Box>
        )
       }
     </Container>
    </>
  )
}

export default App
