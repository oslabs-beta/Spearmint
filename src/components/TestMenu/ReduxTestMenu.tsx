import React, { useState, useEffect, useContext } from 'react';
//Global actions for UI-level state (theme, panel, file updates, etc. )
import {
  updateFile, // Replaces the content of the in-memory file to display
  setFilePath, //Clears or sets the current file path
  toggleRightPanel, //toggle view in right panel
  setValidCode, //flags that generate code is valid
  openBrowserDocs, //open external docs in a browser window
  toggleModal, //shows or hides the New Test model
  toggleExportBool, //Toggles a flag
  setTabIndex, //toggle a flag for showing export dialog
} from '../../context/actions/globalActions'; //Sets which tab of the right panel is active
import {
  createNewReduxTest, //Create a new empty Redux test block
  resetTests, //Clears all Redux tests from the current est case state
} from '../../context/actions/reduxTestCaseActions';
import Modal from '../Modals/Modal';
import useGenerateTest from '../../context/useGenerateTest.jsx'; //Hook that generates test string
import { GlobalContext } from '../../context/reducers/globalReducer';
import { ReduxTestCaseContext } from '../../context/reducers/reduxTestCaseReducer';
import { useToggleModal } from './testMenuHooks';
import TestMenuButtons from './TestMenuButtons'; //renders test buttons
const { ipcRenderer } = require('electron');

const ReduxTestMenu = () => {
  //extracting state variables and dispatch functions to update state from the menu component
  //Access Redux test state (AI)
  const [{ reduxTestStatement, reduxStatements }, dispatchToReduxTestCase] =
    useContext(ReduxTestCaseContext);
  //modal hooks (A5)
  const {
    title,
    isModalOpen,
    openModal,
    openScriptModal,
    closeModal,
    setIsModalOpen,
  } = useToggleModal('redux');
  //Global access application (A0)
  const [
    { projectFilePath, file, fileName, exportBool, isTestModalOpen },
    dispatchToGlobal,
  ] = useContext<any>(GlobalContext);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [userSavedTest, setUserSavedTest] = useState(false);
  //hook that actuaually turn test-state into a string
  //pass in test type and path
  //*** WILL NEED TO UPDATE HOOK DEFINITION TO ADD IN FRAMEWORK TYPE ****
  //src/context/useGenerateTest.jsx file to update
  const generateTest = useGenerateTest('redux', projectFilePath);

  // Redux testing docs url
  const reduxUrl = 'https://redux.js.org/recipes/writing-tests';

  //when ReduxTestMenu setValidCode to true
  //downstream effects??? -- global action
  useEffect(() => {
    dispatchToGlobal(setValidCode(true));
  }, []);

  const openDocs = () => {
    dispatchToGlobal(openBrowserDocs(reduxUrl));
  };

  //oh look it is a closure
  const fileHandle = () => {
    //get test code string
    const testGeneration = generateTest({
      reduxStatements,
      reduxTestStatement,
    });
    //update file with new code
    dispatchToGlobal(updateFile(testGeneration));
    //view the code in the right panel
    dispatchToGlobal(toggleRightPanel('codeEditorView'));
    //clear
    dispatchToGlobal(setFilePath(''));
    //go to first tab
    dispatchToGlobal(setTabIndex(0));
    //return test generation function
    return testGeneration;
  };

  // functionality when user clicks Save Test button
  const saveTest = () => {
    const updatedData = fileHandle();

    // store the file path of the new saved test file
    const newFilePath = `${projectFilePath}/__tests__/${fileName}`;

    // check to see if user has saved test before. If not, then open ExportFileModal
    if (!newFilePath.includes('test.js') || !userSavedTest) {
      dispatchToGlobal(toggleExportBool());
      setIsExportModalOpen(true);
      setUserSavedTest(true);
    }

    // if user already has a saved test file, rewrite the file with the updated data
    if (newFilePath.includes('test.js') && userSavedTest) {
      ipcRenderer.sendSync(
        'ExportFileModal.fileCreate',
        newFilePath,
        updatedData
      );
    }
  };

  //open new redux test modal
  const openNewTestModal = () => {
    if (!isTestModalOpen) dispatchToGlobal(toggleModal());
  };

  //clear current tests
  const handleResetTests = () => {
    dispatchToReduxTestCase(resetTests());
  };

  //if file does not exist we are exporting, create file with updated code
  if (!file && exportBool)
    dispatchToGlobal(
      updateFile(generateTest({ reduxTestStatement, reduxStatements }))
    );

  //***check/fix type errors***
  return (
    <>
      <TestMenuButtons
        resetTests={handleResetTests}
        openModal={openModal}
        fileHandle={fileHandle}
        openScriptModal={openScriptModal}
        saveTest={saveTest}
        openDocs={openDocs}
      />
      <Modal
        // passing methods down as props to be used when Modal is opened
        title={title}
        dispatchToMockData={null}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        setIsModalOpen={setIsModalOpen}
        dispatchTestCase={dispatchToReduxTestCase}
        createTest={createNewReduxTest}
      />
    </>
  );
};

export default ReduxTestMenu;
