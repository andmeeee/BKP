import './CreateTable.css';
import CreateTab from './CreateTab';
import NNTabTitle from '../NNTable/NNTabTitle';

function CreateTable() {

  return (
    <div className="CreateTable">
      <NNTabTitle/>
      <CreateTab/>
    </div>
  );
}

export default CreateTable;
