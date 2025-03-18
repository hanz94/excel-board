import DataGridTableHeight from "./optionsUtils/DataGridTableHeight";
import DataGridColumnWidth from "./optionsUtils/DataGridColumnWidth";
import RowWithColumnNames from "./optionsUtils/RowWithColumnNames";
import TrimRows from "./optionsUtils/TrimRows";
import OptionsNameColumn from "./optionsUtils/optionsNameColumn";
import OptionsSurnameColumn from "./optionsUtils/OptionsSurnameColumn";
import OptionsStartDateColumn from "./optionsUtils/OptionsStartDateColumn";
import OptionsEndDateColumn from "./optionsUtils/OptionsEndDateColumn";

function Options() {

  return (
    <>
      <OptionsNameColumn />
      <OptionsSurnameColumn />
      <OptionsStartDateColumn />
      <OptionsEndDateColumn />
      <RowWithColumnNames />
      <DataGridTableHeight />
      <DataGridColumnWidth />
      <TrimRows />

    </>
  );
}

export default Options;
