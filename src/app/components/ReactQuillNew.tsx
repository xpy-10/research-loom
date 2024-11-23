import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function ReactQuillNew() {
  const [value, setValue] = useState('');
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline','strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'list', 'indent',
    'link', 'image'
  ]


  return <ReactQuill theme="snow" value={value} modules={modules} formats={formats} onChange={setValue} />;
}

export default ReactQuillNew;