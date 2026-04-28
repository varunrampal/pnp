import {React, useState,useEffect} from 'react'
import plants from '../json/PlantsList.json'


const PlantsList = async () => {

    //const [plantsList, setPlantsList] = useState(false);
    
  //    useEffect(() => {
  //   console.log('useEffect');
  //   setPlantsList(true);
  // }, []);

    return (<>  </>
        // <div>
        //     {  plantsList && plantsList.map(({name, id}) => (
        //          <div key={id}>{name}</div>
        //     ))  }

        // </div>
            // <div className=" p-2 md:p-6 bg-gray-100 min-h-screen">
            //   <h1 className="text-3xl font-bold text-gray-700 text-center mb-8">
            //     View Excel File
            //   </h1>
        
            //   {parseExcelFile().length > 0 ? (
            //     <div className="overflow-x-auto">
            //       <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            //         <thead>
            //           <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            //             {Object.keys(parseExcelFile()[0]).map((key) => (
            //               <th key={key} className="py-3 px-6 text-left">
            //                 {key}
            //               </th>
            //             ))}
            //           </tr>
            //         </thead>
            //         <tbody className="text-gray-700 text-sm">
            //           {parseExcelFile().map((row, index) => (
            //             <tr
            //               key={index}
            //               className={`border-b border-gray-300 ${
            //                 index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
            //               }`}
            //             >
            //               {Object.values(row).map((cell, i) => (
            //                 <td key={i} className="py-3 px-6 text-left">
            //                   {cell}
            //                 </td>
            //               ))}
            //             </tr>
            //           ))}
            //         </tbody>
            //       </table>
            //     </div>
            //   ) : (
            //     <p className="text-gray-500 text-center mt-8">Loading Excel data...</p>
            //   )}
            // </div>
          );
  
}

export default PlantsList