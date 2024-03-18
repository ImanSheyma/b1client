import { useState } from 'react';
import CsvDownloader from "react-csv-downloader";
import Datatable from 'react-data-table-component';
import Papa from 'papaparse';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Table.css';

export default function Table() {
  //свойства компонента
  const [array, setArray] = useState([]);
  const [header, setHeader] = useState([]);
  const [currtable, setCurrTable] = useState('user');

  
  //обработчик файл селектора
  const handleChange = (event) => {
    if (event.target.files[0]) {
      //парсер csv файла
      Papa.parse(event.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {updateData(result.data)}
      });
    }
  };


  //функция обновления датасета и заголовков таблицы
  const updateData = (data) => {
    setArray(data);
    //установка заголовков таблицы
    setHeader(Object.keys(data[0]).map(item => {
      return {
        name: item,
        selector: row => row[item],
        sortable: true
      }
    }));
  }


  //функция для добавления новых записей в бд
  const postData = (event) => {
    event.preventDefault();

    //определяем функцию запроса на сервер
    const postData = async() => {
      const requestData = await fetch(
        "https://b1server.onrender.com/"+ currtable, 
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(array)
        }
      );

      //выводим всплывающее сообщение с результатом вызова
      if(requestData.status == 200)
        toast.success("Success!");
      else
        toast.error("Error!");
    }
    //выполняем запрос
    postData();
  }

  //функция запроса записей из бд
  const fetchData = (event) => {
    event.preventDefault();
    //определеям функцию с запросом
    const getData = async() => {
      const requestData = await fetch("https://b1server.onrender.com/"+ currtable);

      if(requestData.status == 200){
        const responseData = await requestData.json();
        //обновляем свойства компонента
        updateData(responseData);
      }
      else
        toast.error("Error!");
    }
    //выполняем запрос
    getData();
  }

  //обработчик selecta'а
  const selectHandler = (event) => {
    const table = event.target.value;
    setCurrTable(table);
  }

  return(
    <div className='component-container'>
      <div className='file-import-container'>
          <div className='file-manager'>
            <label className='input-file'>
              <input
                type="file"
                id={"csvFileInput"}
                accept={".csv"}
                onChange={handleChange}
              />
              <span className="input-file-btn">Import CSV</span>
            </label>
            <CsvDownloader
              datas={array}
              text='Export CSV'
              filename={`data_`+ new Date().toLocaleString()}
              extension='.csv'>
            </CsvDownloader>
          </div>

          <div className='database-manager'>
            <select onChange={selectHandler}> 
              <option>user</option> 
              <option>department</option> 
            </select>
            <button onClick={fetchData}>Fetch Data</button>
            <button onClick={postData}>Post Data</button>
          </div>
      </div>

      <div className='table-container'>
        <Datatable
          columns={header}
          data={array}
          fixedHeader
          pagination
          customStyles={{
            rows:{
              style:{
              fontSize: "16px"
            }
            },
            headCells:{
              style:{
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: "#e8e8e8"
              }
            }
          }}
        ></Datatable>
      </div>

      <div className='toasts'>
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition: Bounce
          >
        </ToastContainer>
      </div>
    </div>
  );
}